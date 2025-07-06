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
const LINEAR_RESISTANCE_WEIGHT = 0.3;

// Weight of aerodynamic drag
const AERODYNAMIC_DRAG_WEIGHT = 0.7;

// Fraction of energy normally spent overcoming drag
const AERODYNAMIC_DRAG_SHARE = 0.6;

// Ideal temperature for battery efficiency
const IDEAL_TEMP = 22;

// Cold penalty per degree below ideal
const COLD_PENALTY_PER_DEGREE = 0.015;

// Hot penalty per degree above ideal
const HOT_PENALTY_PER_DEGREE = 0.01;

export {
  REFERENCE_SPEED,
  CONVERSION_FACTOR,
  MILES_PER_KM,
  MAX_RECUPERATION_EFFECTIVENESS,
  LINEAR_RESISTANCE_WEIGHT,
  AERODYNAMIC_DRAG_WEIGHT,
  AERODYNAMIC_DRAG_SHARE,
  IDEAL_TEMP,
  COLD_PENALTY_PER_DEGREE,
  HOT_PENALTY_PER_DEGREE,
};
