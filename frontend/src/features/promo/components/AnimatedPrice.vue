<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";

const props = defineProps<{ value: number }>();
const shown = ref(props.value);
const direction = ref<"up" | "down" | "">("");
let frame = 0;

watch(
  () => props.value,
  (target, from) => {
    cancelAnimationFrame(frame);
    direction.value = target > from ? "up" : "down";
    const start = performance.now();
    const duration = 550;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      shown.value = Math.round(from + (target - from) * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
      else window.setTimeout(() => (direction.value = ""), 350);
    };
    frame = requestAnimationFrame(tick);
  },
);
onBeforeUnmount(() => cancelAnimationFrame(frame));
</script>

<template>
  <span
    class="inline-block tabular-nums transition-colors duration-300"
    :class="direction === 'up' ? 'text-emerald-600' : direction === 'down' ? 'text-red-600' : ''"
  >R{{ shown }}</span>
</template>
