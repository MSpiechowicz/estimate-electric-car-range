<script lang="ts">
  let {
    label,
    icon: Icon,
    description,
    value = $bindable(),
    onChange,
    index,
    min = 0,
    max = 300,
  } = $props();
</script>

<div class="flex flex-col items-start justify-center gap-2 w-[30ch]">
  <div class="flex flex-col items-start justify-center gap-1">
    <div class="flex flex-row items-center justify-start gap-1.5">
      <Icon customClass="!w-5 !h-auto" customColor="#364153" />
      <span class="text-lg text-gray-900">{label}</span>
    </div>
    <span class="text-sm text-gray-700">{description}</span>
  </div>
  <input
    id={`input-${index}`}
    tabindex={index}
    type="number"
    {min}
    {max}
    class="p-2 rounded-md border-2 border-input-border hover:border-input-hover focus:border-input-focus focus:outline-none w-54"
    bind:value
    oninput={onChange}
    required
  />
</div>
