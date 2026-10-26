
<script setup lang="ts">
import { computed, reactive, ref, onMounted, watch } from 'vue'
import Header from './components/Header.vue'
import BottomNav from './components/BottomNav.vue'
import DesktopSidebar from './components/DesktopSidebar.vue'
import DesktopTopbar from './components/DesktopTopbar.vue'
import HomeLoggedIn from './screens/HomeLoggedIn.vue'
import ScheduleScreen from './screens/ScheduleScreen.vue'
import ServicesScreen from './screens/ServicesScreen.vue'
import InboxScreen from './screens/InboxScreen.vue'
import AccountScreen from './screens/AccountScreen.vue'
import SupportScreen from './screens/SupportScreen.vue'
import ReferralScreen from './screens/ReferralScreen.vue'
import ReviewScreen from './screens/ReviewScreen.vue'
import DesktopDashboard from './screens/DesktopDashboard.vue'
import DesktopPortalPages from './screens/DesktopPortalPages.vue'
import type { AppState, NavActions, Screen, Tab } from './types/navigation'
import { useSession } from './composables/useSession'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()


const routeScreen = computed<Screen>(() => {
  const path = route.path.replace(/\/+$/, '') || '/'

  if (path === '/schedule' || path === '/portal/schedule') {
    return 'schedule'
  }

  if (path === '/account' || path === '/portal/account') {
    return 'account'
  }

  if (path === '/inbox' || path === '/portal/inbox') {
    return 'inbox'
  }

  if (path === '/support' || path === '/portal/support') {
    return 'support'
  }

  return 'home'
})

const routeTab = computed<Tab>(() => {
  if (routeScreen.value === 'schedule') return 'schedule'
  if (routeScreen.value === 'account') return 'account'
  if (routeScreen.value === 'inbox') return 'inbox'

  return 'home'
})

const state = reactive<AppState>({
  isLoggedIn: false,
  activeTab: routeTab.value,
  screen: routeScreen.value,
})

const session = useSession()

onMounted(() => {
  void session.checkSession()
})

watch(
  () => session.isAuthenticated.value,
  (authenticated) => {
    if (authenticated) {
      state.isLoggedIn = true
    } else if (session.status.value === 'guest') {
      state.isLoggedIn = false
      state.screen = 'home'
      state.activeTab = 'home'
    }
  },
)

const history = ref<Screen[]>([])

watch(
  routeScreen,
  (screen) => {
    state.screen = screen
    state.activeTab = routeTab.value
    history.value = []
  },
)

function getTabForScreen(screen: Screen): Tab {
  const scheduleScreens: Screen[] = [
    'schedule',
    'day-detail',
  ]

  const serviceScreens: Screen[] = [
    'services',
    'service-detail',
    'service-chat',
    'checkout',
    'checkout-confirm',
  ]

  const accountScreens: Screen[] = [
    'account',
    'account-personal',
    'account-addresses',
    'account-payment',
    'account-billing',
    'account-plan',
    'account-notifications',
  ]

  const inboxScreens: Screen[] = [
    'inbox',
    'notification-detail',
  ]

  if (scheduleScreens.includes(screen)) return 'schedule'
  if (serviceScreens.includes(screen)) return 'services'
  if (accountScreens.includes(screen)) return 'account'
  if (inboxScreens.includes(screen)) return 'inbox'

  // Support, referrals, reviews and ticket details are
  // secondary screens. Preserve the current primary tab.
  return state.activeTab
}

const actions: NavActions = {
  
  goTo(screen, extra = {}) {
    history.value.push(state.screen)

    Object.assign(state, { screen }, extra)

    state.activeTab = getTabForScreen(screen)

    const routeMap: Partial<Record<Screen, string>> = {
      home: '/',
      schedule: '/schedule',
      account: '/account',
      inbox: '/inbox',
      support: '/support',
    }

    const path = routeMap[screen]

    if (path && route.path !== path) {
      void router.push(path)
    }
  },

  setTab(tab) {
    const screenMap: Record<Tab, Screen> = {
      home: 'home',
      schedule: 'schedule',
      services: 'services',
      inbox: 'inbox',
      account: 'account',
    }

    const routeMap: Partial<Record<Tab, string>> = {
      home: '/',
      schedule: '/schedule',
      account: '/account',
      inbox: '/inbox',
    }

    history.value = []

    Object.assign(state, {
      activeTab: tab,
      screen: screenMap[tab],
    })

    const path = routeMap[tab]

    if (path && route.path !== path) {
      void router.push(path)
    }
  },


  goBack() {
    const previous = history.value.pop()
    if (!previous) return

    state.screen = previous
    state.activeTab = getTabForScreen(previous)
  },

  // login() {
  //   Object.assign(state, {
  //     isLoggedIn: true,
  //     screen: 'home',
  //     activeTab: 'home',
  //     lockTarget: undefined,
  //   })
  //   history.value = []
  // },

  async logout() {
    try {
      await session.logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
}

const showNav = computed(() => state.isLoggedIn)

const showHeader = computed(() => true)


const desktopPortalScreens: Screen[] = [
  'schedule',
  'services',
  'inbox',
  'account',
]

const desktopPortalScreen = computed(() =>
  desktopPortalScreens.includes(state.screen),
)

</script>

<template>
  <div class="flex h-dvh w-full overflow-hidden bg-[#F3F7F4]">
    <DesktopSidebar
      v-if="showNav"
      :active-tab="state.activeTab"
      :on-tab-change="actions.setTab"
      :on-help="() => actions.goTo('support')"
      :on-website="() => window.location.href = '/'"
      :on-logout="actions.logout"
    />

    <div class="flex min-w-0 flex-1 flex-col">
      <div v-if="showHeader" class="lg:hidden">
        <Header :state="state" :actions="actions" />
      </div>

      <DesktopTopbar
        v-if="showNav"
        :state="state"
        :actions="actions"
        :on-logout="actions.logout"
      />

      <main class="scrollbar-hide flex-1 overflow-y-auto">
        <template v-if="state.screen === 'home'">
          <div class="lg:hidden">
            <HomeLoggedIn :state="state" :actions="actions" />
          </div>
          <div class="hidden lg:block">
            <DesktopDashboard :actions="actions" />
          </div>
        </template>

        <template v-else-if="desktopPortalScreen">
          <div class="lg:hidden">
            <ScheduleScreen
              v-if="state.screen === 'schedule'"
              :state="state"
              :actions="actions"
            />
            <ServicesScreen
              v-else-if="state.screen === 'services'"
              :state="state"
              :actions="actions"
            />
            <InboxScreen
              v-else-if="state.screen === 'inbox'"
              :state="state"
              :actions="actions"
            />
            <AccountScreen
              v-else
              :state="state"
              :actions="actions"
            />
          </div>

          <div class="hidden lg:block">
            <DesktopPortalPages
              :state="state"
              :actions="actions"
            />
          </div>
        </template>

        <div v-else class="mx-auto w-full max-w-5xl lg:py-4">
          <ScheduleScreen
            v-if="['schedule', 'day-detail'].includes(state.screen)"
            :state="state"
            :actions="actions"
          />
          <ServicesScreen
            v-else-if="['services', 'service-detail', 'service-chat', 'checkout', 'checkout-confirm'].includes(state.screen)"
            :state="state"
            :actions="actions"
          />
          <InboxScreen
            v-else-if="['inbox', 'notification-detail'].includes(state.screen)"
            :state="state"
            :actions="actions"
          />
          <AccountScreen
            v-else-if="['account', 'account-personal', 'account-addresses', 'account-payment', 'account-billing', 'account-plan', 'account-notifications'].includes(state.screen)"
            :state="state"
            :actions="actions"
          />
          <ReferralScreen
            v-else-if="state.screen === 'referral'"
            :state="state"
            :actions="actions"
          />
          <SupportScreen
            v-else-if="['support', 'ticket-form', 'ticket-detail'].includes(state.screen)"
            :state="state"
            :actions="actions"
          />
          <ReviewScreen
            v-else-if="state.screen === 'review'"
            :state="state"
            :actions="actions"
          />
        </div>
      </main>

      <div v-if="showNav" class="lg:hidden">
        <BottomNav
          :active-tab="state.activeTab"
          :on-tab-change="actions.setTab"
        />
      </div>
    </div>
  </div>
</template>
