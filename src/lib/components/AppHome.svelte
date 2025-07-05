<script lang="ts">
  import IconBattery from "../svg/IconBattery.svelte";
  import IconRecharging from "../svg/IconRecharging.svelte";
  import IconRoad from "../svg/IconRoad.svelte";
  import IconRotate from "../svg/IconRotate.svelte";
  import IconSpeedTest from "../svg/IconSpeedTest.svelte";
  import IconTemperature from "../svg/IconTemperature.svelte";
  import IconWind from "../svg/IconWind.svelte";
  import AppDescription from "./AppDescription.svelte";
  import AppHeader from "./AppHeader.svelte";
  import AppInput from "./AppInput.svelte";
  import AppNotificationBar from "./AppNotificationBar.svelte";

  import { fade } from 'svelte/transition';
  import { carStore } from "../store/carStore.svelte";
  import { parameterStore } from "../store/parameterStore.svelte";

  let showAdvanced = false;

  const inputs = [
    {
      label: "Battery Capacity",
      icon: IconBattery,
      description:
        "The total capacity of the battery in kWh. The higher the capacity, the more energy can be stored in the battery.",
      value: carStore.battery,
    },
    {
      label: "Average Speed",
      icon: IconSpeedTest,
      description:
        "The average driving speed in km/h. The higher the speed, the more energy is used to move the car.",
      value: carStore.speed,
    },
    {
      label: "Consumption",
      icon: IconRecharging,
      description:
        "The average consumption in kWh/100 km. The higher the consumption, the more energy is used to move the car.",
      value: carStore.consumption,
    },
    {
      label: "Recuperation",
      icon: IconRotate,
      description: "The average recuperation in % of energy recovered when braking.",
      value: parameterStore.recuperation,
    },
    {
      label: "Wind Speed",
      icon: IconWind,
      description:
        "The average wind speed in km/h. For headwind, use a positive value. For tailwind, use a negative value.",
      value: parameterStore.windSpeed,
    },
    {
      label: "Temperature",
      icon: IconTemperature,
      description:
        "The average temperature in °C. Lower temperatures often decrease the overall range of the car.",
      value: parameterStore.temperature,
    },
    {
      label: "Road Slope",
      icon: IconRoad,
      description: "The average road slope in %. Positive for uphill, negative for downhill.",
      value: parameterStore.roadSlope,
    },
  ];
</script>

<div class="flex justify-center items-center min-h-screen">
  <div class="max-w-screen-sm w-full bg-white p-6 rounded-lg shadow-md">
    <div class="flex flex-col items-start justify-center gap-2">
      <AppHeader />
      <AppDescription />
      <AppNotificationBar />

      <button
        class="my-4 px-4 py-2 bg-button-primary hover:bg-button-hover text-white rounded self-stretch"
        onclick={() => (showAdvanced = !showAdvanced)}
      >
        {#if showAdvanced}
          Hide Advanced Options
        {:else}
          Show Advanced Options
        {/if}
      </button>

      {#each inputs as input, index}
        {#if index < 3 || showAdvanced}
          <div in:fade={{ duration: 300 }} out:fade={{ duration: 300 }}>
            <AppInput
              {index}
              label={input.label}
              icon={input.icon}
              description={input.description}
              bind:value={input.value}
              onChange={() => {}}
            />
          </div>
        {/if}
      {/each}
    </div>
  </div>
</div>
