<script setup lang="ts">
import { tabs } from "@/config/navigation";
import AppIcon from "./AppIcon.vue";
</script>

<template>
  <nav class="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-primary/8 bg-white/95 px-2 pt-2 backdrop-blur-xl md:hidden">
    <div class="mx-auto grid max-w-lg grid-cols-4">
      <router-link
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-bold text-stone-400"
        active-class="text-primary"
        :exact="tab.to === '/portal'"
      >
        <span class="absolute top-0 h-0.5 w-7 rounded-full bg-accent opacity-0 [.router-link-active_&]:opacity-100" />
        <AppIcon :name="tab.icon" :size="21" />
        {{ tab.label }}
      </router-link>
    </div>
  </nav>
</template>
