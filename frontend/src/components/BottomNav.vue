<script setup lang="ts">
import type { Tab } from '../types/navigation'
defineProps<{ activeTab: Tab; onTabChange: (tab: Tab) => void }>()
const tabs: { id: Tab; label: string }[] = [
  { id: 'home', label: 'Home' }, { id: 'schedule', label: 'Schedule' },
  { id: 'services', label: 'Services' }, { id: 'inbox', label: 'Inbox' },
  { id: 'account', label: 'Account' },
]
</script>

<template>
  <nav class="safe-bottom flex shrink-0 border-t border-gray-100 bg-white" :style="{ paddingBottom: 'env(safe-area-inset-bottom)' }">
    <button v-for="tab in tabs" :key="tab.id" @click="onTabChange(tab.id)" class="flex flex-1 flex-col items-center gap-0.5 py-2 transition-opacity active:opacity-70">
      <svg v-if="tab.id === 'home'" width="22" height="22" viewBox="0 0 24 24" :fill="activeTab === tab.id ? '#073B24' : 'none'" :stroke="activeTab === tab.id ? '#073B24' : '#9CA3AF'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      <svg v-else-if="tab.id === 'schedule'" width="22" height="22" viewBox="0 0 24 24" fill="none" :stroke="activeTab === tab.id ? '#073B24' : '#9CA3AF'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle v-if="activeTab === tab.id" cx="12" cy="16" r="2" fill="#073B24"/></svg>
      <svg v-else-if="tab.id === 'services'" width="22" height="22" viewBox="0 0 24 24" fill="none" :stroke="activeTab === tab.id ? '#073B24' : '#9CA3AF'" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
      <svg v-else-if="tab.id === 'inbox'" width="22" height="22" viewBox="0 0 24 24" fill="none" :stroke="activeTab === tab.id ? '#073B24' : '#9CA3AF'" stroke-width="2" stroke-linecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><circle v-if="activeTab === tab.id" cx="18" cy="6" r="3" fill="#DC2626" stroke="none"/></svg>
      <svg v-else width="22" height="22" viewBox="0 0 24 24" :fill="activeTab === tab.id ? '#073B24' : 'none'" :stroke="activeTab === tab.id ? '#073B24' : '#9CA3AF'" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      <span class="text-[10px] font-medium" :style="{ color: activeTab === tab.id ? '#073B24' : '#9CA3AF' }">{{ tab.label }}</span>
    </button>
  </nav>
</template>
