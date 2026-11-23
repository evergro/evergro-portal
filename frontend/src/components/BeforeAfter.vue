<script setup lang="ts">
defineProps<{ before: string; after: string }>();
</script>

<template>
  <div class="grid grid-cols-2 gap-2 overflow-hidden rounded-2xl">
    <figure class="relative m-0 overflow-hidden bg-stone-100">
      <img :src="before" alt="Garden before the service" class="h-36 w-full object-cover md:h-48" />
      <figcaption class="absolute bottom-2 left-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-primary">Before</figcaption>
    </figure>
    <figure class="relative m-0 overflow-hidden bg-stone-100">
      <img :src="after" alt="Garden after the service" class="h-36 w-full object-cover md:h-48" />
      <figcaption class="absolute bottom-2 left-2 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-white">After</figcaption>
    </figure>
  </div>
</template>
