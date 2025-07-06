import { describe, expect, it } from "vitest";
import {
  AERODYNAMIC_DRAG_SHARE,
  AERODYNAMIC_DRAG_WEIGHT,
  COLD_PENALTY_PER_DEGREE,
  CONVERSION_FACTOR,
  HOT_PENALTY_PER_DEGREE,
  IDEAL_TEMP,
  LINEAR_RESISTANCE_WEIGHT,
  MAX_RECUPERATION_EFFECTIVENESS,
  MILES_PER_KM,
  REFERENCE_SPEED,
} from "../../constants/calculations";
import { carStore } from "../../store/carStore.svelte";
import {
  calculateConsumptionFactor,
  calculateEnergyConsumption,
  calculateRange,
  calculateRangeKm,
  calculateRangeMi,
  calculateRecuperationFactor,
  calculateRoadSlopeFactor,
  calculateSpeedFactor,
  calculateTempFactor,
  calculateWindFactor,
} from "../rangeCalculator.svelte";

carStore.battery = 75;
carStore.consumption = 15;
carStore.speed = 77;


describe("calculateSpeedFactor", () => {
  it("returns 1 at reference speed", () => {
    expect(calculateSpeedFactor(REFERENCE_SPEED)).toBeCloseTo(1);
  });

  it("clamps to a minimum of 0.1 for very low or negative speeds", () => {
    expect(calculateSpeedFactor(0)).toBeCloseTo(0.1);
    expect(calculateSpeedFactor(-10)).toBeCloseTo(0.1);
  });

  it("increases as speed increases", () => {
    const doubleSpeed = REFERENCE_SPEED * 2;
    const expected = LINEAR_RESISTANCE_WEIGHT * 2 + AERODYNAMIC_DRAG_WEIGHT * Math.pow(2, 2);

    expect(calculateSpeedFactor(doubleSpeed)).toBeCloseTo(expected);
  });
});

describe("calculateWindFactor", () => {
  it("returns 1 when speed is below the threshold (no wind influence)", () => {
    expect(calculateWindFactor(0.5, 10)).toBe(1);
  });

  it("increases consumption with a headwind", () => {
    const factor = calculateWindFactor(100, 20); // headwind
    const ratio = (100 + 20) / 100;
    const expected = 1 - AERODYNAMIC_DRAG_SHARE + AERODYNAMIC_DRAG_SHARE * ratio * ratio;
    expect(factor).toBeCloseTo(expected);
    expect(factor).toBeGreaterThan(1);
  });

  it("decreases consumption with a tailwind but not below 0.5", () => {
    const factor = calculateWindFactor(100, -20); // tailwind
    const ratio = (100 - 20) / 100;
    const expected = 1 - AERODYNAMIC_DRAG_SHARE + AERODYNAMIC_DRAG_SHARE * ratio * ratio;
    expect(factor).toBeCloseTo(expected);
    expect(factor).toBeLessThan(1);
    expect(factor).toBeGreaterThanOrEqual(0.5);
  });
});

describe("calculateTempFactor", () => {
  it("returns 1 at the ideal temperature", () => {
    expect(calculateTempFactor(IDEAL_TEMP)).toBe(1);
  });

  it("applies a cold penalty below ideal temperature", () => {
    const temp = IDEAL_TEMP - 10;
    const expected = 1 + 10 * COLD_PENALTY_PER_DEGREE;
    expect(calculateTempFactor(temp)).toBeCloseTo(expected);
  });

  it("applies a hot penalty above ideal temperature", () => {
    const temp = IDEAL_TEMP + 10;
    const expected = 1 + 10 * HOT_PENALTY_PER_DEGREE;
    expect(calculateTempFactor(temp)).toBeCloseTo(expected);
  });
});

describe("calculateRecuperationFactor", () => {
  it("returns 1 when recuperation is 0", () => {
    expect(calculateRecuperationFactor(0)).toBe(1);
  });

  it("returns the minimum factor at 100% recuperation", () => {
    expect(calculateRecuperationFactor(100)).toBeCloseTo(1 - MAX_RECUPERATION_EFFECTIVENESS);
  });

  it("clamps inputs outside the 0-100 range", () => {
    expect(calculateRecuperationFactor(-10)).toBe(1);
    expect(calculateRecuperationFactor(150)).toBeCloseTo(1 - MAX_RECUPERATION_EFFECTIVENESS);
  });
});

describe("calculateRoadSlopeFactor", () => {
  it("is 1 on flat terrain", () => {
    expect(calculateRoadSlopeFactor(0)).toBe(1);
  });

  it("increases on an uphill slope", () => {
    expect(calculateRoadSlopeFactor(5)).toBeCloseTo(1.1);
  });

  it("decreases on a downhill slope but not below 0.1", () => {
    expect(calculateRoadSlopeFactor(-5)).toBeCloseTo(0.9);
    expect(calculateRoadSlopeFactor(-100)).toBe(0.1);
  });
});

describe("calculateConsumptionFactor", () => {
  it("converts kWh/100km to Wh/km correctly", () => {
    expect(calculateConsumptionFactor(15)).toBe(15 * CONVERSION_FACTOR);
  });
});

describe("calculateEnergyConsumption", () => {
  it("multiplies all factors together", () => {
    const result = calculateEnergyConsumption(100, 1.2, 0.9, 1.1, 1, 0.8);
    expect(result).toBeCloseTo(100 * 1.2 * 0.9 * 1.1 * 1 * 0.8);
  });
});

describe("calculateRangeKm & calculateRangeMi", () => {
  it("calculates range in km and converts it to miles", () => {
    const rangeKm = calculateRangeKm(50, 200); // 50 kWh, 200 Wh/km
    const rangeMi = calculateRangeMi(rangeKm);

    expect(rangeKm).toBe(Math.round((50 * 1000) / 200));
    expect(rangeMi).toBe(Math.round(rangeKm * MILES_PER_KM));
  });
});

describe("calculateRange (integration)", () => {
  it("calculates the overall range using the mocked store values", () => {
    const { rangeKm, rangeMi } = calculateRange();

    // The calculation uses the default store values (battery: 50 kWh, speed: 110 km/h, etc.).
    // We know from a manual calculation that these defaults produce roughly:
    //   rangeKm ≈ 599 km
    //   rangeMi ≈ 372 mi
    expect(rangeKm).toBe(599);
    expect(rangeMi).toBe(372);
  });
});
