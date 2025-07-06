import { carStore } from "../store/carStore.svelte";
import { parameterStore } from "../store/parameterStore.svelte";

// Average speed of the official EPA combined test cycle
const REFERENCE_SPEED = 77;
const CONVERSION_FACTOR = 10;
const MILES_PER_KM = 0.621371;
// Recuperation can only recover a fraction of expended energy. We cap its
// effectiveness to 25 % – tweak if you have more accurate data for a specific
// vehicle. A value of 100 % recuperation in the UI will therefore yield a
// 25 % reduction in net consumption (factor = 0.75).
const MAX_RECUPERATION_EFFECTIVENESS = 0.25;

/**
 * Consumption due to rolling resistance grows roughly linearly with speed,
 * whereas aerodynamic drag grows with the square of speed. A simple way to
 * capture these two influences without diving into vehicle-specific drag
 * coefficients is to blend a linear and a quadratic term that are both
 * anchored at the reference speed. We use the following heuristic model:
 *
 * factor = k_linear * (v / v_ref) + k_quad * (v / v_ref)^2
 *
 * where k_linear + k_quad = 1 to ensure the factor is exactly 1 when
 * v == v_ref (77 km/h). Empirically, aerodynamic drag dominates at higher
 * speeds so we assign it a larger weight (e.g. 70 %). To avoid negative or
 * unrealistically small consumption factors at very low speeds we clamp the
 * result to a sensible minimum.
 *
 * @param speed - The speed of the vehicle in km/h.
 * @returns A factor that reduces or increases energy consumption based on the speed.
 */
export function calculateSpeedFactor(speed: number) {
  // Guard for negative inputs
  const safeSpeed = Math.max(0, speed);

  const speedRatio = safeSpeed / REFERENCE_SPEED;

  // Tunable weights – tweak if you have better calibration data
  const K_LINEAR = 0.3; // rolling resistance share
  const K_QUAD = 0.7; // aerodynamic drag share (K_LINEAR + K_QUAD = 1)

  const factor = K_LINEAR * speedRatio + K_QUAD * speedRatio * speedRatio;

  // Ensure the factor never drops below 0.1 (10 % of reference consumption)
  // to account for ancillary loads such as HVAC and electronics when moving
  // at very low speeds.
  return Math.max(0.1, factor);
}

/**
 * Returns a multiplier that adjusts energy consumption based on wind.
 *
 * The key insight is that aerodynamic drag – the portion of consumption that
 * wind influences – depends on the square of the air speed the vehicle
 * experiences (vehicle speed ± wind speed). We therefore:
 *
 * 1. Compute the *relative* air speed: `airSpeed = max(0, speed + windSpeed)`.
 *    • `windSpeed` > 0 → head-wind (airSpeed increases)
 *    • `windSpeed` < 0 → tail-wind (airSpeed decreases)
 *
 * 2. Scale the aerodynamic share of consumption quadratically with the ratio
 *    `(airSpeed / speed)`.
 *
 * 3. Blend it with the rolling-resistance share, which is mostly unaffected by
 *    wind.  At typical highway speeds, aerodynamic losses account for roughly
 *    60 % of total energy use, leaving 40 % for rolling resistance and
 *    drivetrain losses.
 *
 * The resulting factor is:
 *   factor = (1 − AERO_SHARE) + AERO_SHARE · (airSpeed / speed)²
 *
 * Finally we clamp to a sensible minimum (0.5) so an extreme tail-wind cannot
 * unrealistically drop consumption below 50 % of reference.
 *
 * @param speed - The speed of the vehicle in km/h.
 * @param windSpeed - The speed of the wind in km/h.
 * @returns A factor that reduces or increases energy consumption based on the wind speed.
 */
export function calculateWindFactor(speed: number, windSpeed: number) {
  // Prevent division by zero – if speed is extremely low, assume wind has
  // negligible effect on per-distance consumption because aerodynamic drag is
  // tiny compared with auxiliary loads.
  if (speed < 1) {
    return 1;
  }

  // Relative air speed perceived by the car (km/h).
  const airSpeed = Math.max(0, speed + windSpeed);

  const AERO_SHARE = 0.6; // Fraction of energy normally spent overcoming drag

  const ratio = airSpeed / speed;
  const factor = (1 - AERO_SHARE) + AERO_SHARE * ratio * ratio;

  // Avoid unrealistically low factors.
  return Math.max(0.5, factor);
}

/**
 * Calculates the consumption reduction factor from temperature.
 * A lower temperature leads to a larger reduction in energy consumption,
 * up to a realistic maximum effectiveness.
 *
 * @param temperature - A value from -60°C to 20°C.
 * @returns A factor that reduces or increases energy consumption based on the temperature.
 */
export function calculateTempFactor(temperature: number) {
  return temperature < 20
    ? 1 + (20 - temperature) * 0.01
    : 1 + Math.max(0, temperature - 30) * 0.005;
}

/**
 * Calculates the consumption reduction factor from recuperation.
 * A higher recuperation setting (0-100) leads to a larger reduction in
 * energy consumption, up to a realistic maximum effectiveness.
 *
 * @param recuperation - A value from 0 (no regen) to 100 (max regen).
 * @returns A consumption multiplier, e.g., 1.0 for no effect, or 0.75 for max effect.
 */
export function calculateRecuperationFactor(recuperation: number) {
  // Clamp input to [0, 100] and map to a 0-1 scale.
  const perc = Math.min(Math.max(recuperation, 0), 100) / 100;

  // Linearly scale the reduction up to the maximum allowed effectiveness.
  return 1 - perc * MAX_RECUPERATION_EFFECTIVENESS;
}

/**
 * Adjusts consumption for road gradient.  A 1 % uphill increases energy use by
 * roughly 2 %, while a downhill grade provides a corresponding benefit.
 * The factor is clamped so that even extreme downhill slopes cannot drive the
 * multiplier to zero or negative values – we assume at least 10 % of normal
 * consumption remains due to rolling resistance, auxiliary systems, etc.
 *
 * @param roadSlope - Grade in percent, where positive is uphill and negative
 *                    is downhill. Typical roads range from −10 % to +10 %.
 * @returns A factor that reduces or increases energy consumption based on the road slope.
 */
export function calculateRoadSlopeFactor(roadSlope: number) {
  return Math.max(0.1, 1 + roadSlope * 0.02);
}

/**
 * Converts consumption from kWh/100 km to Wh/km.
 *
 * @param consumption - The consumption in kWh/100 km.
 * @returns The consumption in Wh/km.
 */
export function calculateConsumptionFactor(consumption: number) {
  // Convert consumption to Wh/km (kWh/100 km × 10)
  return consumption * CONVERSION_FACTOR;
}

/**
 * Calculates the total energy consumption based on various factors.
 *
 * @param consumptionFactor - The factor that adjusts consumption based on the consumption.
 * @param speedFactor - The factor that adjusts consumption based on the speed.
 * @param windFactor - The factor that adjusts consumption based on the wind speed.
 * @param tempFactor - The factor that adjusts consumption based on the temperature.
 * @param roadSlopeFactor - The factor that adjusts consumption based on the road slope.
 * @param recuperationFactor - The factor that adjusts consumption based on the recuperation.
 * @returns The total energy consumption.
 */
export function calculateEnergyConsumption(
  consumptionFactor: number,
  speedFactor: number,
  windFactor: number,
  tempFactor: number,
  roadSlopeFactor: number,
  recuperationFactor: number
) {
  return (
    consumptionFactor * speedFactor * windFactor * tempFactor * roadSlopeFactor * recuperationFactor
  );
}

export function calculateRangeKm(battery: number, adjustedWhPerKm: number) {
  return Math.round((battery * 1000) / adjustedWhPerKm);
}

export function calculateRangeMi(rangeKm: number) {
  return Math.round(rangeKm * MILES_PER_KM);
}

export function calculateRange() {
  const { battery, consumption, speed } = carStore;
  const { windSpeed, temperature, roadSlope, recuperation } = parameterStore;

  const speedFactor = calculateSpeedFactor(speed);
  const windFactor = calculateWindFactor(speed, windSpeed);
  const tempFactor = calculateTempFactor(temperature);
  const recuperationFactor = calculateRecuperationFactor(recuperation);
  const roadSlopeFactor = calculateRoadSlopeFactor(roadSlope);
  const consumptionFactor = calculateConsumptionFactor(consumption);

  const energyConsumption = calculateEnergyConsumption(
    consumptionFactor,
    speedFactor,
    windFactor,
    tempFactor,
    roadSlopeFactor,
    recuperationFactor
  );

  const rangeKm = calculateRangeKm(battery, energyConsumption);
  const rangeMi = calculateRangeMi(rangeKm);

  return { rangeKm, rangeMi };
}
