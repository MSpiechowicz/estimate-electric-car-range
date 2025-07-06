<script lang="ts">
  import AppInput from "./AppInput.svelte";

  import IconBattery from "../svg/IconBattery.svelte";
  import IconRecharging from "../svg/IconRecharging.svelte";
  import IconSpeedTest from "../svg/IconSpeedTest.svelte";

  import { carStore } from "../store/carStore.svelte";
</script>

<AppInput
  onChange={() => {}}
  index={0}
  label="Battery Capacity"
  icon={IconBattery}
  min={0}
  description="The total capacity of the battery in kWh. The higher the capacity, the more energy can be stored in the battery."
  bind:value={carStore.battery}
/>

<AppInput
  onChange={() => {}}
  index={1}
  label="Average Speed"
  min={0}
  icon={IconSpeedTest}
  description="The average driving speed in km/h. The higher the speed, the more energy is used to move the car."
  bind:value={carStore.speed}
/>

<AppInput
  onChange={() => {}}
  index={2}
  label="Consumption"
  min={0}
  icon={IconRecharging}
  description="The average consumption in kWh/100 km. The higher the consumption, the more energy is used to move the car."
  bind:value={carStore.consumption}
/>
