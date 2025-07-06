<script lang="ts">
  import AppActions from "./AppActions.svelte";
  import AppAdvancedInputs from "./AppAdvancedInputs.svelte";
  import AppBasicInputs from "./AppBasicInputs.svelte";
  import AppDescription from "./AppDescription.svelte";
  import AppEstimatedRange from "./AppEstimatedRange.svelte";
  import AppHeader from "./AppHeader.svelte";
  import AppNotificationBar from "./AppNotificationBar.svelte";

  import { carStore } from "../store/carStore.svelte";
  import { calculateRange } from "../utils/rangeCalculator.svelte";

  let showAdvanced = $state(false);

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    const { rangeKm, rangeMi } = calculateRange();
    carStore.range = rangeKm;
    carStore.rangeMi = rangeMi;
  }
</script>

<div class={"p-4 md:p-10 flex justify-center items-center min-h-screen"}>
  <form class="max-w-screen-sm w-full bg-white p-6 rounded-lg shadow-md" onsubmit={handleSubmit}>
    <div class="flex flex-col items-start justify-center gap-2">
      <AppHeader />
      <AppDescription />
      <AppNotificationBar />

      <div class="mt-4 mb-2 flex flex-col items-start justify-center gap-4">
        <AppBasicInputs />
        <AppAdvancedInputs bind:showAdvanced />
      </div>

      <AppActions bind:showAdvanced />
      <AppEstimatedRange />
    </div>
  </form>
</div>
