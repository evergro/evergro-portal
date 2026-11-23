<script setup lang="ts">
defineProps<{ status: string }>();
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold"
    :class="{
      'bg-emerald-100 text-emerald-800': status === 'Completed' || status === 'Paid',
      'bg-red-100 text-red-700': status === 'Skipped' || status === 'Overdue',
      'bg-accent text-primary': status === 'Rescheduled',
      'bg-stone-100 text-stone-600': status === 'Upcoming',
      'bg-amber-100 text-amber-800': status === 'Due',
    }"
  >
    {{ status }}
  </span>
</template>
