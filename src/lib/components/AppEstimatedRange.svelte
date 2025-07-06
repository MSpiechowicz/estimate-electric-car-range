<script lang="ts">
  import { fade } from "svelte/transition";
  import { carStore } from "../store/carStore.svelte";

  import IconRouteX from "../svg/IconRouteX.svelte";
</script>

{#if carStore.range > 0}
  <div class="w-full mt-2" in:fade={{ duration: 300 }} out:fade={{ duration: 0 }}>
    <div
      class="flex items-center gap-3 p-4 rounded-lg border-2 border-secondary bg-[var(--color-secondary)]/10 shadow-sm"
    >
      <IconRouteX customClass="w-8 h-8 text-secondary" />
      <div class="flex flex-col">
        <span class="uppercase text-xs font-semibold text-gray-600 tracking-wide"
          >Estimated Range</span
        >
        <span class="text-3xl font-extrabold text-secondary">
          {carStore.range} km
          <span class="text-lg font-medium text-gray-700"> / {carStore.rangeMi} miles</span>
        </span>
      </div>
    </div>
  </div>
{/if}
