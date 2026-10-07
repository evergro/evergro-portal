<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import Header from './components/Header.vue'
import BottomNav from './components/BottomNav.vue'
import DesktopSidebar from './components/DesktopSidebar.vue'
import DesktopTopbar from './components/DesktopTopbar.vue'
import HomePublic from './screens/HomePublic.vue'
import HomeLoggedIn from './screens/HomeLoggedIn.vue'
import LoginScreen from './screens/LoginScreen.vue'
import LockScreen from './screens/LockScreen.vue'
import ScheduleScreen from './screens/ScheduleScreen.vue'
import ServicesScreen from './screens/ServicesScreen.vue'
import InboxScreen from './screens/InboxScreen.vue'
import AccountScreen from './screens/AccountScreen.vue'
import SupportScreen from './screens/SupportScreen.vue'
import ReferralScreen from './screens/ReferralScreen.vue'
import ReviewScreen from './screens/ReviewScreen.vue'
import DesktopDashboard from './screens/DesktopDashboard.vue'
import LandingPage from './screens/LandingPage.vue'
import PortalLogin from './screens/PortalLogin.vue'
import DesktopPortalPages from './screens/DesktopPortalPages.vue'
import type { AppState, NavActions, Screen, Tab } from './types/navigation'

const state = reactive<AppState>({ isLoggedIn: false, activeTab: 'home', screen: 'landing' })
const history = ref<Screen[]>([])
const protectedTabs: Tab[] = ['schedule', 'inbox', 'account']

const actions: NavActions = {
  goTo(screen, extra = {}) {
    history.value.push(state.screen)
    Object.assign(state, { screen }, extra)
  },
  setTab(tab) {
    if (!state.isLoggedIn && protectedTabs.includes(tab)) {
      history.value.push(state.screen)
      Object.assign(state, { screen: 'lock', activeTab: tab, lockTarget: tab })
      return
    }
    const screenMap: Record<Tab, Screen> = {
      home: state.isLoggedIn ? 'home' : 'home-public',
      schedule: 'schedule', services: 'services', inbox: 'inbox', account: 'account',
    }
    history.value = []
    Object.assign(state, { activeTab: tab, screen: screenMap[tab] })
  },
  goBack() {
    const previous = history.value.at(-1)
    if (!previous) return
    history.value.pop()
    state.screen = previous
  },
  login() {
    Object.assign(state, { isLoggedIn: true, screen: 'home', activeTab: 'home', lockTarget: undefined })
    history.value = []
  },
  logout() {
    Object.assign(state, { isLoggedIn: false, activeTab: 'home', screen: 'landing', lockTarget: undefined })
    history.value = []
  },
}

const showNav = computed(() => state.isLoggedIn && !['landing','login','signup-otp','signup-name','signup-address','signup-plan','lock'].includes(state.screen))
const showHeader = computed(() => !['landing','login','signup-otp','signup-name','signup-address','signup-plan'].includes(state.screen))
const desktopPortalScreen = computed(() => ['schedule','services','inbox','account'].includes(state.screen))
</script>

<template>
  <div class="flex h-dvh w-full overflow-hidden bg-[#F3F7F4]">
    <DesktopSidebar v-if="showNav" :active-tab="state.activeTab" :on-tab-change="actions.setTab" :on-help="() => actions.goTo('support')" :on-website="() => actions.goTo('landing')"/>
    <div class="flex min-w-0 flex-1 flex-col">
      <div v-if="showHeader" class="lg:hidden"><Header :state="state" :actions="actions"/></div>
      <DesktopTopbar v-if="showNav" :state="state" :actions="actions"/>
      <main class="scrollbar-hide flex-1 overflow-y-auto">
        <LandingPage v-if="state.screen==='landing'" :is-logged-in="state.isLoggedIn" :actions="actions"/>
        <PortalLogin v-else-if="state.screen==='login'" :actions="actions"/>
        <template v-else-if="state.screen==='home'"><div class="lg:hidden"><HomeLoggedIn :state="state" :actions="actions"/></div><div class="hidden lg:block"><DesktopDashboard :actions="actions"/></div></template>
        <template v-else-if="desktopPortalScreen"><div class="lg:hidden"><ScheduleScreen v-if="state.screen==='schedule'" :state="state" :actions="actions"/><ServicesScreen v-else-if="state.screen==='services'" :state="state" :actions="actions"/><InboxScreen v-else-if="state.screen==='inbox'" :state="state" :actions="actions"/><AccountScreen v-else :state="state" :actions="actions"/></div><div class="hidden lg:block"><DesktopPortalPages :state="state" :actions="actions"/></div></template>
        <div v-else :class="showNav ? 'mx-auto w-full max-w-5xl lg:py-4' : 'mx-auto h-full w-full max-w-sm'">
          <HomePublic v-if="state.screen==='home-public'" :state="state" :actions="actions"/>
          <LoginScreen v-else-if="['signup-otp','signup-name','signup-address','signup-plan'].includes(state.screen)" :state="state" :actions="actions"/>
          <LockScreen v-else-if="state.screen==='lock'" :state="state" :actions="actions"/>
          <ScheduleScreen v-else-if="['schedule','day-detail'].includes(state.screen)" :state="state" :actions="actions"/>
          <ServicesScreen v-else-if="['services','service-detail','service-chat','checkout','checkout-confirm'].includes(state.screen)" :state="state" :actions="actions"/>
          <InboxScreen v-else-if="['inbox','notification-detail'].includes(state.screen)" :state="state" :actions="actions"/>
          <AccountScreen v-else-if="['account','account-personal','account-addresses','account-payment','account-billing','account-plan','account-notifications'].includes(state.screen)" :state="state" :actions="actions"/>
          <ReferralScreen v-else-if="state.screen==='referral'" :state="state" :actions="actions"/>
          <SupportScreen v-else-if="['support','ticket-form','ticket-detail'].includes(state.screen)" :state="state" :actions="actions"/>
          <ReviewScreen v-else-if="state.screen==='review'" :state="state" :actions="actions"/>
        </div>
      </main>
      <div v-if="showNav" class="lg:hidden"><BottomNav :active-tab="state.activeTab" :on-tab-change="actions.setTab"/></div>
    </div>
  </div>
</template>
