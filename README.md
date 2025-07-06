# Estimate your electric car range

Project that help with estimation of average electric car range.

## Assets

All of the Assets presents within the project are based on the open source projects:

- [Favicon](https://favicon.io/emoji-favicons/electric-plug)
- [Tabler](https://tabler.io/icons)

## Github Pages

You can test the live demo at the project [github pages](https://mspiechowicz.github.io/estimate-electric-car-range/).

### FAQ

#### Why a "Combined" Speed is the Best Default

A user looking at a range calculator typically wants a general, "real-world" estimate of what they can expect from a full charge. Most driving isn't exclusively high-speed highway cruising or low-speed city crawling; it's a mix of both.

Represents Reality:
The EPA combined cycle (55% city, 45% highway) is designed to simulate typical American driving patterns. Its average speed of ~48 mph provides a balanced baseline.

Avoids Extremes:
Using a pure highway speed (e.g., 70 mph) as the default would be pessimistic and scare users who do mixed driving.
Using a pure city speed (e.g., 25 mph) would be overly optimistic and lead to disappointment on road trips.

It's a Standardized Benchmark:
Basing your default on the EPA's methodology gives it credibility.
