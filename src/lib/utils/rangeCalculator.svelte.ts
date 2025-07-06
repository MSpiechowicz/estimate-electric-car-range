import {
  AERODYNAMIC_DRAG_SHARE,
  COLD_PENALTY_PER_DEGREE,
  CONSUMPTION_FACTOR_AT_HIGH_SPEED_THRESHOLD,
  CONSUMPTION_FACTOR_AT_LOW_SPEED_THRESHOLD,
  CONSUMPTION_FACTOR_AT_VERY_HIGH_SPEED_THRESHOLD,
  CONVERSION_FACTOR,
  HIGH_SPEED_THRESHOLD,
  HOT_PENALTY_PER_DEGREE,
  IDEAL_TEMP,
  LOW_SPEED_THRESHOLD,
  MAX_RECUPERATION_EFFECTIVENESS,
  MILES_PER_KM,
  POWER_FACTOR_ABOVE_VERY_HIGH_SPEED,
  VERY_HIGH_SPEED_THRESHOLD,
} from "../constants/calculations";
import { carStore } from "../store/carStore.svelte";
import { parameterStore } from "../store/parameterStore.svelte";

/**
 * Calculates the consumption factor based on the speed.
 * The model is a piecewise function that anchors at the reference speed and
 * applies a quadratic penalty for deviation. This aims to provide a more
 * accurate and tunable curve for consumption based on speed.
 *
 * @param speed - The speed of the vehicle in km/h.
 * @returns A factor that reduces or increases energy consumption based on the speed.
 */
export function calculateSpeedFactor(speed: number) {
  // Guard for negative inputs
  const safeSpeed = Math.max(0, speed);

  // Clamp to a minimum for very low speeds
  if (safeSpeed <= LOW_SPEED_THRESHOLD) {
    return CONSUMPTION_FACTOR_AT_LOW_SPEED_THRESHOLD;
  }

  // Increase linearly between low and high speed thresholds
  if (safeSpeed <= HIGH_SPEED_THRESHOLD) {
    const ratio = (safeSpeed - LOW_SPEED_THRESHOLD) / (HIGH_SPEED_THRESHOLD - LOW_SPEED_THRESHOLD);
    return (
      CONSUMPTION_FACTOR_AT_LOW_SPEED_THRESHOLD +
      ratio *
        (CONSUMPTION_FACTOR_AT_HIGH_SPEED_THRESHOLD - CONSUMPTION_FACTOR_AT_LOW_SPEED_THRESHOLD)
    );
  }

  // Increase linearly between high and very high speed thresholds
  if (safeSpeed <= VERY_HIGH_SPEED_THRESHOLD) {
    const ratio =
      (safeSpeed - HIGH_SPEED_THRESHOLD) / (VERY_HIGH_SPEED_THRESHOLD - HIGH_SPEED_THRESHOLD);
    return (
      CONSUMPTION_FACTOR_AT_HIGH_SPEED_THRESHOLD +
      ratio *
        (CONSUMPTION_FACTOR_AT_VERY_HIGH_SPEED_THRESHOLD -
          CONSUMPTION_FACTOR_AT_HIGH_SPEED_THRESHOLD)
    );
  }

  // Power law increase above very high speed threshold
  const ratio = safeSpeed / VERY_HIGH_SPEED_THRESHOLD;
  return (
    CONSUMPTION_FACTOR_AT_VERY_HIGH_SPEED_THRESHOLD *
    Math.pow(ratio, POWER_FACTOR_ABOVE_VERY_HIGH_SPEED)
  );
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

  const ratio = airSpeed / speed;
  const factor = 1 - AERODYNAMIC_DRAG_SHARE + AERODYNAMIC_DRAG_SHARE * ratio * ratio;

  // Avoid unrealistically low factors.
  return Math.max(0.5, factor);
}

/**
 * Calculates the consumption adjustment factor based on ambient temperature.
 * The model assumes an ideal temperature for battery efficiency and adds
 * penalties for temperatures outside this ideal.
 * - Below ideal: Increased consumption due to battery chemistry and heating.
 * - Above ideal: Increased consumption due to battery cooling and cabin A/C.
 *
 * @param temperature - Ambient temperature in Celsius.
 * @returns A consumption multiplier (e.g., 1.0 at ideal temp, >1 otherwise).
 */
export function calculateTempFactor(temperature: number): number {
  if (temperature < IDEAL_TEMP) {
    // Colder than ideal, apply cold penalty
    return 1 + (IDEAL_TEMP - temperature) * COLD_PENALTY_PER_DEGREE;
  } else {
    // Warmer than ideal, apply hot penalty
    return 1 + (temperature - IDEAL_TEMP) * HOT_PENALTY_PER_DEGREE;
  }
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

/**
 * Calculates the range in kilometers based on the battery capacity and the adjusted Wh/km.
 *
 * @param battery - The battery capacity in kWh.
 * @param adjustedWhPerKm - The adjusted Wh/km.
 * @returns The range in kilometers.
 */
export function calculateRangeKm(battery: number, adjustedWhPerKm: number) {
  return Math.round((battery * 1000) / adjustedWhPerKm);
}

/**
 * Calculates the range in miles based on the range in kilometers.
 *
 * @param rangeKm - The range in kilometers.
 * @returns The range in miles.
 */
export function calculateRangeMi(rangeKm: number) {
  return Math.round(rangeKm * MILES_PER_KM);
}

/**
 * Calculates the range in kilometers and miles based on the battery capacity, consumption, speed, wind speed, temperature, road slope, and recuperation.
 *
 * @returns The range in kilometers and miles.
 */
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
