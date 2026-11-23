<script setup lang="ts">
withDefaults(defineProps<{ padded?: boolean }>(), { padded: true });
</script>

<template>
  <section
    class="card-shadow rounded-3xl border border-primary/6 bg-white"
    :class="{ 'p-5 md:p-6': padded }"
  >
    <slot />
  </section>
</template>
