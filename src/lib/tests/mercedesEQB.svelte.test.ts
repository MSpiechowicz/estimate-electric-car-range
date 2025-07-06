import { describe, expect, it } from "vitest";
import { carStore } from "../store/carStore.svelte";
import { calculateRange } from "../utils/rangeCalculator.svelte";

describe("calculateRange", () => {
  it("should return the correct range for the Mercedes EQB at 80 km/h", () => {
    carStore.battery = 66;
    carStore.consumption = 16;
    carStore.speed = 80;

    const { rangeKm } = calculateRange();
    // Range should be within range 390 to 415 km
    expect(rangeKm).toBeGreaterThan(390);
    expect(rangeKm).toBeLessThan(415);
  });

  it("should return the correct range for the Mercedes EQB at 100 km/h", () => {
    carStore.battery = 66;
    carStore.consumption = 19;
    carStore.speed = 100;

    const { rangeKm } = calculateRange();
    // Range should be within range 330 to 350 km
    expect(rangeKm).toBeGreaterThan(330);
    expect(rangeKm).toBeLessThan(350);
  });

  it("should return the correct range for the Mercedes EQB at 120 km/h", () => {
    carStore.battery = 66;
    carStore.consumption = 21;
    carStore.speed = 120;

    const { rangeKm } = calculateRange();
    // Range should be within range 310 to 330 km
    expect(rangeKm).toBeGreaterThan(310);
    expect(rangeKm).toBeLessThan(330);
  });
});
