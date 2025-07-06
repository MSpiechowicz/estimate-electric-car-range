import { carStore } from "../store/carStore.svelte";
import { parameterStore } from "../store/parameterStore.svelte";

// Average speed of the official EPA combined test cycle
const REFERENCE_SPEED = 77;
const CONVERSION_FACTOR = 10;
const MILES_PER_KM = 0.621371;

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

export function calculateWindFactor(windSpeed: number) {
  // Positive windSpeed represents a headwind (increasing consumption)
  // Negative windSpeed represents a tailwind (reducing consumption)
  // Each 1 km/h of wind changes consumption by 1 %.
  // Clamp the factor to avoid unrealistically low or negative values.
  return Math.max(0.5, 1 + windSpeed / 100);
}

export function calculateTempFactor(temperature: number) {
  return temperature < 20
    ? 1 + (20 - temperature) * 0.01
    : 1 + Math.max(0, temperature - 30) * 0.005;
}

export function calculateRecuperationFactor(recuperation: number) {
  return 1 - Math.min(Math.max(recuperation, 0), 100) / 100;
}

export function calculateTiltFactor(roadSlope: number) {
  return 1 + roadSlope * 0.02;
}

export function calculateConsumptionFactor(consumption: number) {
  // Convert consumption to Wh/km (kWh/100 km × 10)
  return consumption * CONVERSION_FACTOR;
}

export function calculateEnergyConsumption(
  consumptionFactor: number,
  speedFactor: number,
  windFactor: number,
  tempFactor: number,
  tiltFactor: number,
  recuperationFactor: number
) {
  return (
    consumptionFactor * speedFactor * windFactor * tempFactor * tiltFactor * recuperationFactor
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
  const windFactor = calculateWindFactor(windSpeed);
  const tempFactor = calculateTempFactor(temperature);
  const recuperationFactor = calculateRecuperationFactor(recuperation);
  const tiltFactor = calculateTiltFactor(roadSlope);
  const consumptionFactor = calculateConsumptionFactor(consumption);

  const energyConsumption = calculateEnergyConsumption(
    consumptionFactor,
    speedFactor,
    windFactor,
    tempFactor,
    tiltFactor,
    recuperationFactor
  );

  const rangeKm = calculateRangeKm(battery, energyConsumption);
  const rangeMi = calculateRangeMi(rangeKm);

  return { rangeKm, rangeMi };
}
