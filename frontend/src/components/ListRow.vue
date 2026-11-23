<script setup lang="ts">
import AppIcon from "./AppIcon.vue";

defineProps<{ label: string; icon: string; to?: string; danger?: boolean }>();
defineEmits<{ click: [] }>();
</script>

<template>
  <component
    :is="to ? 'router-link' : 'button'"
    :to="to"
    type="button"
    class="flex min-h-16 w-full items-center gap-4 border-b border-stone-100 px-1 text-left last:border-0"
    :class="danger ? 'text-red-600' : 'text-primary'"
    @click="$emit('click')"
  >
    <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft">
      <AppIcon :name="icon" :size="20" />
    </span>
    <span class="flex-1 font-semibold">{{ label }}</span>
    <AppIcon v-if="to" name="chevron" :size="18" class="text-stone-400" />
  </component>
</template>
