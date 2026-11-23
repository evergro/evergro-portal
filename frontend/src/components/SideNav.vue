<script setup lang="ts">
import { tabs } from "@/config/navigation";
import AppIcon from "./AppIcon.vue";
defineEmits<{ logout: [] }>();
</script>

<template>
  <aside class="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-primary p-5 text-white md:flex">
    <div class="flex items-center gap-3 px-2 py-5">
      <span class="grid size-10 place-items-center rounded-2xl bg-accent font-black text-primary">E</span>
      <div>
        <p class="text-lg font-black tracking-tight">Evergro</p>
        <p class="text-xs text-white/55">Customer portal</p>
      </div>
    </div>
    <nav class="mt-8 space-y-2">
      <router-link
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-bold text-white/60 transition hover:bg-white/8 hover:text-white"
        active-class="!bg-white/12 !text-white"
        :exact="tab.to === '/portal'"
      >
        <AppIcon :name="tab.icon" :size="20" />
        {{ tab.label }}
        <span class="ml-auto size-2 rounded-full bg-accent opacity-0 [.router-link-active_&]:opacity-100" />
      </router-link>
    </nav>
    <button type="button" class="mt-auto flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-bold text-white/65 hover:bg-white/8 hover:text-white" @click="$emit('logout')">
      <AppIcon name="logout" :size="20" />
      Log out
    </button>
  </aside>
</template>
