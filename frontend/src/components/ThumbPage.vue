<script setup lang="ts">
// Mobile: content sits at the bottom of the screen (thumb zone) when it is
// shorter than the viewport. Desktop: normal top-aligned flow.
withDefaults(defineProps<{ maxWidth?: string }>(), { maxWidth: "max-w-xl" });
</script>

<template>
  <div class="mx-auto flex w-full flex-1 flex-col px-4 pt-6 md:block md:px-8 md:pt-10" :class="maxWidth">
    <slot name="top" />
    <div class="mt-auto pt-6 md:mt-0 md:pt-0"><slot /></div>
  </div>
</template>
