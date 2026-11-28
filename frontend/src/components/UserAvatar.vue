<script setup lang="ts">
defineProps<{ avatar: string; image?: string | null }>();
</script>

<template>
  <span class="grid place-items-center overflow-hidden bg-primary font-bold text-white">
    <img v-if="image" :src="image" alt="" class="size-full object-cover" />
    <template v-else>{{ avatar }}</template>
  </span>
</template>
