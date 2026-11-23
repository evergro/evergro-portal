<script setup lang="ts">
defineProps<{ modelValue: boolean; label: string }>();
const emit = defineEmits<{ "update:modelValue": [value: boolean]; change: [] }>();
</script>

<template>
  <label class="flex min-h-14 cursor-pointer items-center justify-between gap-4 border-b border-stone-100 py-2 last:border-0">
    <span class="font-medium text-stone-700">{{ label }}</span>
    <input
      type="checkbox"
      class="sr-only"
      :checked="modelValue"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked); emit('change')"
    />
    <span
      class="relative h-7 w-12 rounded-full transition"
      :class="modelValue ? 'bg-primary' : 'bg-stone-300'"
    >
      <span
        class="absolute top-1 size-5 rounded-full bg-white shadow-sm transition"
        :class="modelValue ? 'left-6' : 'left-1'"
      />
    </span>
  </label>
</template>
