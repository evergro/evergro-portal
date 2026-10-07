<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { AppState, NavActions } from '../types/navigation'
const props = defineProps<{ state: AppState; actions: NavActions }>()
interface Profile {
  full_name: string
  email: string
  phone: string | null
  birthday: string | null
  customer_since: string | null
  has_image: boolean
}
const profile = ref<Profile | null>(null)
function privateImageUrl(doctype: string, name: string) {
  return `/api/method/portal.api.portal.get_private_image?doctype=${encodeURIComponent(doctype)}&name=${encodeURIComponent(name)}`
}
const loading = ref(true)
const titles: Partial<Record<AppState['screen'], string>> = { schedule: 'Schedule', services: 'Services', inbox: 'Inbox', account: 'Account', support: 'Help & support' }
const title = computed(() => titles[props.state.screen] || (props.state.screen === 'home' ? 'Overview' : 'Evergro'))
const initials = computed(() => {
  if (!profile.value?.full_name) return 'EG'

  return profile.value.full_name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((name: string) => name.charAt(0).toUpperCase())
    .join('')
})
async function loadProfile() {
  try {
    loading.value = true

    const response = await fetch(
      '/api/method/portal.api.portal.get_profile',
      {
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to load profile: ${response.status}`)
    }

    const data = await response.json()
    profile.value = data.message
  } catch (error) {
    console.error('Failed to load customer profile:', error)
  } finally {
    loading.value = false
  }
}
onMounted(loadProfile)
</script>
<template>
  <header class="hidden h-[76px] shrink-0 items-center justify-between border-b border-[#DDE7E1] bg-white px-8 lg:flex">
    <div>
      <p class="font-[Outfit] text-xl font-semibold text-[#173228]">{{ title }}</p>
      <p class="text-xs text-[#789086]">
        {{ profile?.email || 'Customer portal' }}
      </p>
    </div>
    <div class="flex items-center gap-3">
      <button @click="actions.goTo('support')"
        class="flex h-10 items-center gap-2 rounded-xl border border-[#DDE7E1] px-4 text-sm font-semibold text-[#315347] hover:bg-[#F3F7F4]"><svg
          width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.1 9a3 3 0 1 1 5.5 1.7c-.9 1.1-2.6 1.3-2.6 3.3M12 18h.01" />
        </svg>Help</button>
      <button @click="actions.goTo('inbox')"
        class="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#DDE7E1] text-[#315347] hover:bg-[#F3F7F4]"
        aria-label="Notifications"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        </svg><span class="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#DC2626] ring-2 ring-white" /></button>
      <button @click="actions.setTab('account')"
        class="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 hover:bg-[#F3F7F4]"><div
          class="h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-[#073B24]"
        >
          <img
            v-if="profile?.has_image"
            :src="privateImageUrl('Contact', profile.full_name)"
            :alt="profile.full_name"
            draggable="false"
            @contextmenu.prevent
            class="h-full w-full select-none object-cover"
          />

          <span
            v-else
            class="flex h-full w-full items-center justify-center text-xs font-bold text-white"
          >
            {{ initials }}
          </span>
        </div>
        <div class="text-left">
          <p class="text-xs font-semibold text-[#173228]">
            {{ loading ? 'Loading...' : profile?.full_name || 'Customer' }}
          </p>
          <p class="text-[10px] text-[#789086]">
            {{ profile?.phone || 'Customer' }}
          </p>
        </div>
      </button>
    </div>
  </header>
</template>
