export const parameterStore = $state({
  // km/h
  windSpeed: 0,
  // °C
  temperature: 20,
  // % - positive for uphill, negative for downhill
  roadSlope: 0,
  // % of energy recovered when braking
  recuperation: 10,
});
