<script setup lang="ts">
import { computed } from 'vue'
import type { AppState, NavActions } from '../types/navigation'
const props = defineProps<{ state: AppState; actions: NavActions }>()
const labels: Record<string, string> = { schedule: 'your lawn visits', inbox: 'your notifications', account: 'your account' }
const label = computed(() => labels[props.state.lockTarget || 'schedule'] || 'your account')
</script>
<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-[#F3F7F4] px-6 pb-16">
    <div class="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#E6F0EB]"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#073B24" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
    <h2 class="text-center font-[Outfit] text-[1.375rem] font-bold text-[#073B24]">Log in to see {{ label }}</h2><p class="mb-8 mt-2 text-center text-sm text-gray-500">Create a free account or log in to access all of Evergro's features.</p>
    <button @click="actions.goTo('login')" class="mb-3 w-full rounded-2xl bg-[#073B24] py-4 text-base font-bold text-white active:opacity-80">Log in</button>
    <button @click="actions.goTo('signup-otp')" class="w-full rounded-2xl border-2 border-[#073B24] py-4 text-sm font-semibold text-[#073B24] active:opacity-80">Create a free account</button>
    <button @click="actions.goBack" class="mt-5 text-sm font-medium text-gray-400">Back</button>
  </div>
</template>
