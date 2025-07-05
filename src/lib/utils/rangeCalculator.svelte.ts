import { carStore } from "../store/carStore.svelte";
import { parameterStore } from "../store/parameterStore.svelte";

// Average speed of the official EPA combined test cycle
const REFERENCE_SPEED = 77;
const CONVERSION_FACTOR = 10;
const MILES_PER_KM = 0.621371;

export function calculateSpeedFactor(speed: number) {
  return 1 + 0.005 * (speed - REFERENCE_SPEED);
}

export function calculateWindFactor(windSpeed: number) {
  return 1 + Math.abs(windSpeed) / 100;
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
  return (battery * 1000) / adjustedWhPerKm;
}

export function calculateRangeMi(rangeKm: number) {
  return rangeKm * MILES_PER_KM;
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
