<script lang="ts">
  import AppAdvancedInputs from "./AppAdvancedInputs.svelte";
  import AppBasicInputs from "./AppBasicInputs.svelte";
  import AppDescription from "./AppDescription.svelte";
  import AppHeader from "./AppHeader.svelte";
  import AppNotificationBar from "./AppNotificationBar.svelte";

  import IconCalculator from "../svg/IconCalculator.svelte";
  import IconRouteX from "../svg/IconRouteX.svelte";

  import { fade } from "svelte/transition";
  import { carStore } from "../store/carStore.svelte";
  import { calculateRange } from "../utils/rangeCalculator.svelte";

  let showAdvanced = $state(false);
</script>

<div class={`flex justify-center items-center min-h-screen ${showAdvanced ? "my-10" : ""}`}>
  <div class="max-w-screen-sm w-full bg-white p-6 rounded-lg shadow-md">
    <div class="flex flex-col items-start justify-center gap-2">
      <AppHeader />
      <AppDescription />
      <AppNotificationBar />

      <AppBasicInputs />
      <AppAdvancedInputs bind:showAdvanced />

      <div class="flex flex-row items-start justify-center gap-2">
        <button
          class="my-4 px-4 py-2 bg-button-primary hover:bg-button-hover text-white rounded self-stretch flex items-center justify-center gap-2 w-54"
          onclick={() => {
            const { rangeKm, rangeMi } = calculateRange();
            carStore.range = rangeKm;
            carStore.rangeMi = rangeMi;
          }}
        >
          <IconCalculator customClass="w-6 h-6" />
          Calculate Range
        </button>
        <button
          class="my-4 px-4 py-2 bg-trasparent border-2 border-secondary text-secondary hover:text-white hover:bg-secondary rounded self-stretch flex items-center justify-center gap-2"
          onclick={() => (showAdvanced = !showAdvanced)}
        >
          {#if showAdvanced}
            Hide Advanced Options
          {:else}
            Show Advanced Options
          {/if}
        </button>
      </div>

      {#if carStore.range > 0}
        <div
          class="flex flex-col items-start justify-center gap-2"
          in:fade={{ duration: 300 }}
          out:fade={{ duration: 0 }}
        >
          <div class="flex items-center gap-2">
            <IconRouteX customClass="w-6 h-6" />
            <h3 class="text-lg text-black font-bold">
              Estimated Range: {carStore.range} km / {carStore.rangeMi} miles
            </h3>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
