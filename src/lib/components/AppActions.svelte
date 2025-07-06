<script lang="ts">
  import IconCalculator from "../svg/IconCalculator.svelte";

  let { showAdvanced = $bindable() } = $props();
</script>

<div class="flex flex-col md:flex-row items-start justify-center gap-0 md:gap-2">
  <button
    type="submit"
    class="my-2 md:my-4 px-4 py-2 bg-button-primary hover:bg-button-hover text-white rounded self-stretch flex items-center justify-center gap-2 w-54"
  >
    <IconCalculator customClass="w-6 h-6" />
    Calculate Range
  </button>
  <button
    type="button"
    class="my-2 md:my-4 px-4 py-2 bg-trasparent border-2 border-secondary text-secondary hover:text-white hover:bg-secondary rounded self-stretch flex items-center justify-center gap-2"
    onclick={() => (showAdvanced = !showAdvanced)}
  >
    {#if showAdvanced}
      Hide Advanced Options
    {:else}
      Show Advanced Options
    {/if}
  </button>
</div>
