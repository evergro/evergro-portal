<script setup lang="ts">
import AppIcon from "./AppIcon.vue";
defineProps<{ message: string }>();
</script>

<template>
  <Transition name="toast">
    <div
      v-if="message"
      class="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white shadow-xl md:bottom-8"
    >
      <AppIcon name="check" :size="17" />
      {{ message }}
    </div>
  </Transition>
</template>
