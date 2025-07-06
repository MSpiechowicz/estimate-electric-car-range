import { describe, expect, it } from "vitest";
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
  it("clamps to a minimum for very low or negative speeds", () => {
    expect(calculateSpeedFactor(0)).toBeCloseTo(CONSUMPTION_FACTOR_AT_LOW_SPEED_THRESHOLD);
    expect(calculateSpeedFactor(-10)).toBeCloseTo(CONSUMPTION_FACTOR_AT_LOW_SPEED_THRESHOLD);
    expect(calculateSpeedFactor(LOW_SPEED_THRESHOLD / 2)).toBeCloseTo(
      CONSUMPTION_FACTOR_AT_LOW_SPEED_THRESHOLD
    );
  });

  it("increases linearly between low and high speed thresholds", () => {
    const midSpeed = (LOW_SPEED_THRESHOLD + HIGH_SPEED_THRESHOLD) / 2;
    const expected =
      CONSUMPTION_FACTOR_AT_LOW_SPEED_THRESHOLD +
      0.5 *
        (CONSUMPTION_FACTOR_AT_HIGH_SPEED_THRESHOLD - CONSUMPTION_FACTOR_AT_LOW_SPEED_THRESHOLD);
    expect(calculateSpeedFactor(midSpeed)).toBeCloseTo(expected);
  });

  it("increases linearly between high and very high speed thresholds", () => {
    const midSpeed = (HIGH_SPEED_THRESHOLD + VERY_HIGH_SPEED_THRESHOLD) / 2;
    const expected =
      CONSUMPTION_FACTOR_AT_HIGH_SPEED_THRESHOLD +
      0.5 *
        (CONSUMPTION_FACTOR_AT_VERY_HIGH_SPEED_THRESHOLD -
          CONSUMPTION_FACTOR_AT_HIGH_SPEED_THRESHOLD);
    expect(calculateSpeedFactor(midSpeed)).toBeCloseTo(expected);
  });

  it("increases by power law above very high speed threshold", () => {
    const veryHighSpeed = VERY_HIGH_SPEED_THRESHOLD * 1.5;
    const ratio = veryHighSpeed / VERY_HIGH_SPEED_THRESHOLD;
    const expected =
      CONSUMPTION_FACTOR_AT_VERY_HIGH_SPEED_THRESHOLD *
      Math.pow(ratio, POWER_FACTOR_ABOVE_VERY_HIGH_SPEED);
    expect(calculateSpeedFactor(veryHighSpeed)).toBeCloseTo(expected);
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

    // The calculation uses the default store values (battery: 75 kWh, speed: 77 km/h, etc.).
    // We know from a manual calculation that these defaults produce roughly:
    //   rangeKm ≈ 502 km
    //   rangeMi ≈ 312 mi
    expect(rangeKm).toBe(502);
    expect(rangeMi).toBe(312);
  });
});
