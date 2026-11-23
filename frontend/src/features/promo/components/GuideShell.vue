<script setup lang="ts">
import AppIcon from "@/components/AppIcon.vue";

defineProps<{ step?: number; steps?: number; wide?: boolean; backTo?: string }>();
</script>

<template>
  <div class="relative flex min-h-dvh flex-col overflow-hidden bg-primary text-white">
    <svg class="pointer-events-none absolute -right-32 -bottom-16 w-[44rem] max-w-none opacity-30" viewBox="0 0 700 300" fill="none" aria-hidden="true">
      <path d="M0 220C150 150 300 290 480 190S650 120 700 150" stroke="#E5D403" stroke-width="10" stroke-linecap="round" />
    </svg>
    <header class="safe-top relative z-10 px-4 md:px-8">
      <div class="mx-auto flex h-14 items-center gap-3" :class="wide ? 'max-w-5xl' : 'max-w-md'">
        <router-link v-if="backTo" :to="backTo" class="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 hover:bg-white/15" aria-label="Back"><AppIcon name="back" :size="20" /></router-link>
        <slot name="back" />
        <div v-if="step && steps" class="flex flex-1 gap-1.5" role="progressbar" :aria-valuenow="step" :aria-valuemax="steps">
          <span v-for="n in steps" :key="n" class="h-1 flex-1 rounded-full transition-colors duration-500" :class="n <= step ? 'bg-accent' : 'bg-white/20'" />
        </div>
        <span v-else class="flex-1" />
        <router-link to="/promo" class="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 hover:bg-white/15" aria-label="Close"><AppIcon name="close" :size="20" /></router-link>
      </div>
    </header>
    <main class="relative z-10 mx-auto flex w-full flex-1 flex-col px-4 pb-4 md:px-8" :class="wide ? 'max-w-5xl' : 'max-w-md'">
      <slot />
    </main>
  </div>
</template>
