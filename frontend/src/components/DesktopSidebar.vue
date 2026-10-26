<script setup lang="ts">
import type { Tab } from '../types/navigation'
defineProps<{ activeTab: Tab; onTabChange: (tab: Tab) => void; onHelp: () => void; onWebsite: () => void; onLogout: () => void }>()
const navItems: { id: Tab; label: string; path: string }[] = [
  { id: 'home', label: 'Overview', path: 'M3 9.5 12 3l9 6.5V21h-6v-7H9v7H3V9.5Z' },
  { id: 'schedule', label: 'Schedule', path: 'M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z' },
  { id: 'services', label: 'Services', path: 'M12 3v4m0 10v4M3 12h4m10 0h4M5.6 5.6l2.8 2.8m7.2 7.2 2.8 2.8m0-12.8-2.8 2.8m-7.2 7.2-2.8 2.8M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' },
  { id: 'inbox', label: 'Inbox', path: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9Zm-5 13h-2' },
  { id: 'account', label: 'Account', path: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z' },
]
</script>
<template>
  <aside class="hidden w-[248px] shrink-0 flex-col bg-[#073B24] px-4 py-6 text-white lg:flex">
    <div class="flex items-center gap-3 px-3 w-[158px]"><img
          src="../assets/Logo Landscape White.png" alt="Evergro">
    </div>
    <nav class="mt-10 space-y-1.5" aria-label="Main navigation">
      <button v-for="item in navItems" :key="item.id" @click="onTabChange(item.id)"
        class="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors"
        :class="activeTab === item.id ? 'bg-white text-[#073B24]' : 'text-white/65 hover:bg-white/8 hover:text-white'">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round">
          <path :d="item.path" />
        </svg>{{ item.label }}
        <span v-if="item.id === 'inbox'"
          class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E5D403] px-1.5 text-[10px] font-bold text-[#073B24]">3</span>
      </button>
    </nav>
    <div class="mt-auto">
      <div class="mb-4 rounded-2xl bg-white/8 p-4">
        <p class="text-xs font-semibold text-white/55">WEEKLY MAINTENANCE</p>
        <p class="mt-1 font-[Outfit] text-base font-semibold">Your plan is active</p>
        <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div class="h-full w-3/4 rounded-full bg-[#E5D403]" />
        </div>
        <p class="mt-2 text-xs text-white/55">3 of 4 visits this month</p>
      </div>
      <button @click="onHelp"
        class="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-white/70 hover:bg-white/8 hover:text-white"><svg
          width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
        </svg>Help & support</button>
      <button @click="onWebsite"
        class="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-white/70 hover:bg-white/8 hover:text-white"><svg
          width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
        </svg>Visit Evergro website</button>
      <button @click="onLogout"
        class="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-[#DC2626] hover:bg-white/8 hover:text-[#DC2626]"><svg
          width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>Logout</button>
    </div>
  </aside>
</template>
