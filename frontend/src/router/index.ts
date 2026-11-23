import { createRouter, createWebHistory } from "vue-router";
import { usePromoFlow } from "@/features/promo/usePromoFlow";

const deeper = (title: string) => ({ title, hideTabs: true });

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/portal" },
    { path: "/portal", component: () => import("@/features/home/HomeView.vue") },
    { path: "/portal/schedule", component: () => import("@/features/schedule/ScheduleView.vue") },
    { path: "/portal/schedule/:id", component: () => import("@/features/schedule/VisitDetailView.vue"), meta: deeper("Visit details") },
    { path: "/portal/support", component: () => import("@/features/support/SupportView.vue") },
    { path: "/portal/account", component: () => import("@/features/account/AccountView.vue") },
    { path: "/portal/account/profile", component: () => import("@/features/account/profile/ProfileView.vue"), meta: deeper("Your Profile") },
    { path: "/portal/account/password", component: () => import("@/features/account/profile/PasswordView.vue"), meta: deeper("Change Password") },
    { path: "/portal/account/payments", component: () => import("@/features/account/payments/PaymentsView.vue"), meta: deeper("Your Payments") },
    { path: "/portal/account/payments/transactions", component: () => import("@/features/account/payments/TransactionsView.vue"), meta: deeper("Transactions") },
    { path: "/portal/account/payments/card", component: () => import("@/features/account/payments/CardView.vue"), meta: deeper("Active Card") },
    { path: "/portal/account/payments/checkout", component: () => import("@/features/account/payments/CheckoutView.vue"), meta: deeper("Secure Payment") },
    { path: "/portal/account/refer", component: () => import("@/features/account/ReferView.vue"), meta: deeper("Refer a Friend") },
    { path: "/portal/account/properties", component: () => import("@/features/account/properties/PropertiesView.vue"), meta: deeper("My Properties") },
    { path: "/portal/account/properties/:id", component: () => import("@/features/account/properties/PropertyView.vue"), meta: deeper("Property Details") },
    { path: "/portal/account/notifications", component: () => import("@/features/account/notifications/NotificationsView.vue"), meta: deeper("Notification Settings") },
    { path: "/portal/account/notifications/email", component: () => import("@/features/account/notifications/ChannelView.vue"), props: { channel: "Email" }, meta: deeper("Email Notifications") },
    { path: "/portal/account/notifications/whatsapp", component: () => import("@/features/account/notifications/ChannelView.vue"), props: { channel: "WhatsApp" }, meta: deeper("WhatsApp Notifications") },
    { path: "/promo/:campaign?", component: () => import("@/features/promo/PromoLandingView.vue"), meta: { bare: true } },
    { path: "/start/locate", component: () => import("@/features/promo/LocateView.vue"), meta: { bare: true, requiresAddress: true } },
    { path: "/start/details", component: () => import("@/features/promo/DetailsView.vue"), meta: { bare: true, requiresAddress: true } },
    { path: "/start/pricing", redirect: "/start/guide" },
    { path: "/start/guide", component: () => import("@/features/promo/GuideView.vue"), meta: { bare: true, requiresAddress: true, requiresLayout: true } },
    { path: "/start/plan", component: () => import("@/features/promo/PlanView.vue"), meta: { bare: true, requiresAddress: true, requiresLayout: true } },
    { path: "/start/success", component: () => import("@/features/promo/PromoSuccessView.vue"), meta: { bare: true } },
    { path: "/start/checkout", component: () => import("@/features/promo/PromoCheckoutView.vue"), meta: { bare: true, requiresAddress: true, requiresLayout: true } },
    { path: "/start/analysing", component: () => import("@/features/promo/AnalysingView.vue"), meta: { bare: true, requiresAddress: true, requiresLayout: true } },
    { path: "/start/quote-requested", component: () => import("@/features/promo/QuoteRequestedView.vue"), meta: { bare: true, requiresAddress: true } },
    { path: "/start/waitlist", component: () => import("@/features/promo/WaitlistView.vue"), meta: { bare: true, requiresAddress: true } },
    { path: "/:pathMatch(.*)*", redirect: "/portal" },
  ],
  scrollBehavior: () => ({ top: 0 }),
});

// Promo onboarding steps need the data collected in the earlier steps.
router.beforeEach((to) => {
  const { state } = usePromoFlow();
  if (to.meta.requiresAddress && !state.address) return "/promo";
  if (to.meta.requiresLayout && !state.layoutId) return "/start/details";
});

export default router;
