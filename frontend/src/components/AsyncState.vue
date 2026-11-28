<script setup lang="ts">
import { computed } from "vue";
import AppButton from "./AppButton.vue";

const props = defineProps<{
  resource: { data: unknown; loading: boolean; error: unknown; reload: () => unknown };
  emptyText?: string;
}>();

const isEmpty = computed(() => {
  const data = props.resource.data;
  return data == null || (Array.isArray(data) && data.length === 0);
});
</script>

<template>
  <p v-if="resource.loading && isEmpty" role="status" class="py-8 text-center text-sm font-bold text-primary/50">Loading…</p>
  <div v-else-if="resource.error" role="alert" class="space-y-3 py-8 text-center">
    <p class="text-sm font-bold text-primary">Something went wrong. Please try again.</p>
    <AppButton variant="secondary" @click="resource.reload()">Try again</AppButton>
  </div>
  <slot v-else-if="!isEmpty" />
  <slot v-else name="empty">
    <p class="py-8 text-center text-sm font-bold text-primary/50">{{ emptyText ?? "Nothing here yet." }}</p>
  </slot>
</template>
