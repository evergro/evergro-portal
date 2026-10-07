<script setup lang="ts">
import { computed } from 'vue'
import type { AppState, NavActions } from '../types/navigation'
const props = defineProps<{ state: AppState; actions: NavActions }>()
const titles: Partial<Record<AppState['screen'], string>> = { schedule: 'Schedule', services: 'Services', inbox: 'Inbox', account: 'Account', support: 'Help & support' }
const title = computed(() => titles[props.state.screen] || (props.state.screen === 'home' ? 'Overview' : 'Evergro'))
</script>
<template>
  <header class="hidden h-[76px] shrink-0 items-center justify-between border-b border-[#DDE7E1] bg-white px-8 lg:flex">
    <div><p class="font-[Outfit] text-xl font-semibold text-[#173228]">{{ title }}</p><p class="text-xs text-[#789086]">12 Oak Street, Rondebosch</p></div>
    <div class="flex items-center gap-3">
      <button @click="actions.goTo('support')" class="flex h-10 items-center gap-2 rounded-xl border border-[#DDE7E1] px-4 text-sm font-semibold text-[#315347] hover:bg-[#F3F7F4]"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 1 1 5.5 1.7c-.9 1.1-2.6 1.3-2.6 3.3M12 18h.01"/></svg>Help</button>
      <button @click="actions.goTo('inbox')" class="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#DDE7E1] text-[#315347] hover:bg-[#F3F7F4]" aria-label="Notifications"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/></svg><span class="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#DC2626] ring-2 ring-white"/></button>
      <button @click="actions.setTab('account')" class="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 hover:bg-[#F3F7F4]"><img src="https://images.unsplash.com/photo-1689728318937-17d24bc0a65c?w=80&h=80&fit=crop&auto=format" alt="Sam Mitchell" class="h-9 w-9 rounded-xl object-cover"/><div class="text-left"><p class="text-xs font-semibold text-[#173228]">Sam Mitchell</p><p class="text-[10px] text-[#789086]">Customer</p></div></button>
    </div>
  </header>
</template>
