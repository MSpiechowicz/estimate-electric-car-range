<script lang="ts">
  import AppInput from "./AppInput.svelte";

  import IconRoad from "../svg/IconRoad.svelte";
  import IconRotate from "../svg/IconRotate.svelte";
  import IconTemperature from "../svg/IconTemperature.svelte";
  import IconWind from "../svg/IconWind.svelte";

  import { fade } from "svelte/transition";
  import { parameterStore } from "../store/parameterStore.svelte";

  let { showAdvanced = $bindable(false) } = $props();
</script>

{#if showAdvanced}
  <div in:fade={{ duration: 300 }} out:fade={{ duration: 0 }}>
    <AppInput
      onChange={() => {}}
      index={3}
      label="Recuperation"
      icon={IconRotate}
      description="The average recuperation in % of energy recovered when braking."
      bind:value={parameterStore.recuperation}
    />
  </div>

  <div in:fade={{ duration: 300 }} out:fade={{ duration: 0 }}>
    <AppInput
      onChange={() => {}}
      index={4}
      label="Wind Speed"
      icon={IconWind}
      description="The average wind speed in km/h. For headwind, use a positive value. For tailwind, use a negative value."
      bind:value={parameterStore.windSpeed}
    />
  </div>

  <div in:fade={{ duration: 300 }} out:fade={{ duration: 0 }}>
    <AppInput
      onChange={() => {}}
      index={5}
      label="Temperature"
      icon={IconTemperature}
      description="The average temperature in °C. Lower temperatures often decrease the overall range of the car."
      bind:value={parameterStore.temperature}
    />
  </div>

  <div in:fade={{ duration: 300 }} out:fade={{ duration: 0 }}>
    <AppInput
      onChange={() => {}}
      index={6}
      label="Road Slope"
      icon={IconRoad}
      description="The average road slope in %. Positive for uphill, negative for downhill."
      bind:value={parameterStore.roadSlope}
    />
  </div>
{/if}
