<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "primary" | "secondary" | "danger";
    type?: "button" | "submit";
    disabled?: boolean;
  }>(),
  { variant: "primary", type: "button", disabled: false },
);
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
    :class="{
      'bg-primary text-white shadow-lg shadow-primary/15 hover:bg-primary/90': variant === 'primary',
      'border border-primary/15 bg-white text-primary hover:bg-primary-soft': variant === 'secondary',
      'bg-red-50 text-red-700 hover:bg-red-100': variant === 'danger',
    }"
  >
    <slot />
  </button>
</template>
