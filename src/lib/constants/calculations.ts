// Average speed of the official EPA combined test cycle
const REFERENCE_SPEED = 77;

// Conversion factor from kWh/100 km to Wh/km
const CONVERSION_FACTOR = 10;

// Conversion factor from km to miles
const MILES_PER_KM = 0.621371;

// Recuperation can only recover a fraction of expended energy. We cap its
// effectiveness to 25 % – tweak if you have more accurate data for a specific
// vehicle. A value of 100 % recuperation in the UI will therefore yield a
// 25 % reduction in net consumption (factor = 0.75).
const MAX_RECUPERATION_EFFECTIVENESS = 0.25;

// Weight of linear resistance
const LINEAR_RESISTANCE_WEIGHT = 0.5;

// Weight of aerodynamic drag
const AERODYNAMIC_DRAG_WEIGHT = 0.3;

// Fraction of energy normally spent overcoming drag
const AERODYNAMIC_DRAG_SHARE = 0.6;

// Ideal temperature for battery efficiency
const IDEAL_TEMP = 22;

// Cold penalty per degree below ideal
const COLD_PENALTY_PER_DEGREE = 0.015;

// Hot penalty per degree above ideal
const HOT_PENALTY_PER_DEGREE = 0.01;

// New constants for improved speed factor calculation (multi-segment piecewise)
const LOW_SPEED_THRESHOLD = 20; // km/h
const HIGH_SPEED_THRESHOLD = 100; // km/h
const VERY_HIGH_SPEED_THRESHOLD = 120; // km/h (new breakpoint)
const CONSUMPTION_FACTOR_AT_LOW_SPEED_THRESHOLD = 1.05; // Target for ~1.2 at 80km/h
const CONSUMPTION_FACTOR_AT_HIGH_SPEED_THRESHOLD = 1.25; // Target for ~1.25 at 100km/h
const CONSUMPTION_FACTOR_AT_VERY_HIGH_SPEED_THRESHOLD = 1.2; // Target for ~1.2 at 120km/h
const POWER_FACTOR_ABOVE_VERY_HIGH_SPEED = 1.0; // Linear increase after 120km/h

export {
  AERODYNAMIC_DRAG_SHARE,
  AERODYNAMIC_DRAG_WEIGHT,
  COLD_PENALTY_PER_DEGREE,
  CONSUMPTION_FACTOR_AT_HIGH_SPEED_THRESHOLD,
  CONSUMPTION_FACTOR_AT_LOW_SPEED_THRESHOLD,
  CONSUMPTION_FACTOR_AT_VERY_HIGH_SPEED_THRESHOLD,
  CONVERSION_FACTOR,
  HIGH_SPEED_THRESHOLD,
  HOT_PENALTY_PER_DEGREE,
  IDEAL_TEMP,
  LINEAR_RESISTANCE_WEIGHT,
  LOW_SPEED_THRESHOLD,
  MAX_RECUPERATION_EFFECTIVENESS,
  MILES_PER_KM,
  POWER_FACTOR_ABOVE_VERY_HIGH_SPEED,
  REFERENCE_SPEED,
  VERY_HIGH_SPEED_THRESHOLD,
};
