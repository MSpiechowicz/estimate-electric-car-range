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
  <path d="M3 17l4 4" />
  <path d="M7 17l-4 4" />
  <path d="M17 3l4 4" />
  <path d="M21 3l-4 4" />
  <path d="M11 19h5.5a3.5 3.5 0 0 0 0 -7h-8a3.5 3.5 0 0 1 0 -7h4.5" />
</svg>
