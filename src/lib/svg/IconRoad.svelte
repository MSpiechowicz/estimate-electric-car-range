<script lang="ts">
  let { customClass, customColor = "currentColor" } = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke={customColor}
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  class={customClass}
>
  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
  <path d="M4 19l4 -14" />
  <path d="M16 5l4 14" />
  <path d="M12 8v-2" />
  <path d="M12 13v-2" />
  <path d="M12 18v-2" />
</svg>
