export type Tab = "home" | "schedule" | "services" | "inbox" | "account"

export type Screen = "landing" | "home-public" | "home" | "login" | "signup-otp" | "signup-name" | "signup-address" | "signup-plan" | "schedule" | "day-detail" | "services" | "service-detail" | "service-chat" | "checkout" | "checkout-confirm" | "inbox" | "notification-detail" | "account" | "account-personal" | "account-addresses" | "account-payment" | "account-billing" | "account-plan" | "account-notifications" | "referral" | "support" | "ticket-form" | "ticket-detail" | "review" | "lock"

export interface AppState {
  isLoggedIn: boolean
  activeTab: Tab
  screen: Screen
  selectedDate?: string
  selectedServiceId?: number
  selectedNotificationId?: number
  lockTarget?: Tab
}

export interface NavActions {
  goTo: (screen: Screen, extra?: Partial<AppState>) => void
  setTab: (tab: Tab) => void
  goBack: () => void
  login: () => void
  logout: () => void
}
