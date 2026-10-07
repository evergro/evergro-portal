<script setup lang="ts">
import { computed } from 'vue'
import type { AppState, NavActions } from '../types/navigation'

const props = defineProps<{ state: AppState; actions: NavActions }>()
const titles: Record<string, string | null> = {
  'home-public': null, home: null, schedule: 'My Schedule', 'day-detail': 'Visit Details',
  services: 'Services', 'service-detail': 'Service Details', 'service-chat': 'Get a Quote',
  checkout: 'Checkout', 'checkout-confirm': 'Booking Confirmed', inbox: 'Inbox',
  'notification-detail': 'Notification', account: 'My Account', 'account-personal': 'Personal Info',
  'account-addresses': 'My Properties', 'account-payment': 'Payment Methods',
  'account-billing': 'Billing History', 'account-plan': 'My Plan',
  'account-notifications': 'Notification Settings', referral: 'Refer a Friend',
  support: 'Help & Support', 'ticket-form': 'New Ticket', 'ticket-detail': 'Support Ticket',
  review: 'Rate Your Visit', lock: null,
}
const backScreens = new Set(['day-detail','service-detail','service-chat','checkout','checkout-confirm','notification-detail','account-personal','account-addresses','account-payment','account-billing','account-plan','account-notifications','referral','ticket-form','ticket-detail','review','lock'])
const title = computed(() => titles[props.state.screen])
const showBack = computed(() => backScreens.has(props.state.screen))
const isHome = computed(() => props.state.screen === 'home' || props.state.screen === 'home-public')
</script>

<template>
  <header class="flex shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
    <div class="w-10">
      <button v-if="showBack" @click="actions.goBack" class="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100 active:bg-gray-200" aria-label="Go back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#073B24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
      </button>
    </div>
    <div class="flex flex-1 justify-center">
      <div v-if="isHome" class="flex items-center gap-1.5">
        <div class="flex h-7 w-7 items-center justify-center rounded-full bg-[#073B24]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/><path d="M12 6v6l4 2"/></svg>
        </div>
        <span class="font-[Outfit] text-xl font-bold tracking-[-0.02em] text-[#073B24]">evergro</span>
      </div>
      <span v-else class="font-[Outfit] text-[1.0625rem] font-semibold text-[#111827]">{{ title || '' }}</span>
    </div>
    <div class="flex w-10 justify-end">
      <button @click="actions.goTo('support')" class="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#E6F0EB] active:bg-[#d0e4d8]" aria-label="Help">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#073B24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </button>
    </div>
  </header>
</template>
