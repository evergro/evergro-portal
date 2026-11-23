<script setup lang="ts">
defineProps<{ light?: boolean }>();
</script>

<template>
  <span class="inline-flex items-center gap-2" aria-label="Evergro Landscapers">
    <svg viewBox="0 0 40 40" class="size-9" aria-hidden="true">
      <path d="M6 27c-2-9 3-19 14-20 8-.8 14 4 14 11 0 5-3.600 8-8 8-3 0-5-1.800-5-4.200 0-2.500 2-4 4.500-4" fill="none" stroke="#E5D403" stroke-width="4.500" stroke-linecap="round" />
      <path d="M12 21c0-5 4-9 9-9-.2 5.500-3.500 9-9 9Z" fill="#E5D403" />
      <path d="M6 31c7 4 18 4 28-2" fill="none" stroke="#E5D403" stroke-width="3" stroke-linecap="round" />
    </svg>
    <span class="leading-none">
      <span class="block text-2xl font-extrabold tracking-tight" :class="light ? 'text-white' : 'text-primary'">evergro</span>
      <span class="mt-0.5 block text-[0.55rem] font-bold tracking-[0.22em]" :class="light ? 'text-accent' : 'text-primary/60'">LANDSCAPERS</span>
    </span>
  </span>
</template>
