<script setup lang="ts">
import type { HouseLayout, ZoneId } from "@/types";

const props = defineProps<{
  layout: HouseLayout;
  included?: ZoneId[];
  interactive?: boolean;
  labels?: boolean;
}>();
const emit = defineEmits<{ select: [zone: ZoneId] }>();

const isOn = (id: ZoneId) => props.included?.includes(id) ?? false;
const center = (rect: [number, number, number, number]) => ({ x: rect[0] + rect[2] / 2, y: rect[1] + rect[3] / 2 });
</script>

<template>
  <svg viewBox="0 0 200 160" class="h-auto w-full select-none" role="img" :aria-label="layout.name">
    <rect width="200" height="160" rx="10" class="fill-primary-soft" />
    <rect y="150" width="200" height="10" class="fill-primary/80" />
    <path d="M12 155h14M44 155h14M76 155h14M108 155h14M140 155h14M172 155h14" stroke="#fff" stroke-width="1.500" stroke-linecap="round" opacity=".7" />
    <g v-for="zone in layout.zones" :key="zone.id">
      <g
        :role="interactive ? 'button' : undefined"
        :tabindex="interactive ? 0 : undefined"
        :aria-label="interactive ? zone.label : undefined"
        :class="interactive ? 'cursor-pointer outline-none' : ''"
        @click="interactive && emit('select', zone.id)"
        @keydown.enter.prevent="interactive && emit('select', zone.id)"
        @keydown.space.prevent="interactive && emit('select', zone.id)"
      >
        <rect
          v-for="(rect, index) in zone.rects"
          :key="index"
          :x="rect[0]" :y="rect[1]" :width="rect[2]" :height="rect[3]" rx="5"
          class="transition-all duration-500"
          :class="isOn(zone.id) ? 'fill-primary' : 'fill-white stroke-primary/25'"
          :stroke-dasharray="isOn(zone.id) ? undefined : '3 3'"
          stroke-width="1"
        />
        <text
          v-if="labels"
          :x="center(zone.rects[0]).x" :y="center(zone.rects[0]).y + 2.500"
          text-anchor="middle" font-size="7.500" font-weight="800"
          class="pointer-events-none transition-all duration-500"
          :class="isOn(zone.id) ? 'fill-white' : 'fill-primary/55'"
        >{{ zone.label }}</text>
      </g>
    </g>
    <g v-for="(rect, index) in layout.house" :key="`h${index}`">
      <rect :x="rect[0]" :y="rect[1]" :width="rect[2]" :height="rect[3]" rx="4" fill="#fff" class="stroke-primary/40" stroke-width="1.500" />
      <path :d="`M${rect[0] + 6} ${rect[1] + rect[3] / 2}h${rect[2] - 12}`" class="stroke-primary/20" stroke-width="1" />
      <text v-if="labels" :x="rect[0] + rect[2] / 2" :y="rect[1] + rect[3] / 2 + 6" text-anchor="middle" font-size="7" font-weight="800" class="fill-primary/40">HOME</text>
    </g>
    <line x1="8" x2="192" :y1="layout.gate[1]" :y2="layout.gate[1]" class="stroke-primary/50" stroke-width="1.500" stroke-dasharray="1 3" stroke-linecap="round" />
    <rect :x="layout.gate[0] - 10" :y="layout.gate[1] - 2" width="20" height="4" rx="2" class="fill-accent" />
  </svg>
</template>
