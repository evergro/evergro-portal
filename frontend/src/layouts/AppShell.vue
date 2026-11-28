<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import BottomTabBar from "@/components/BottomTabBar.vue";
import MemberPromoPopup from "@/features/promo/components/MemberPromoPopup.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import PageHeader from "@/components/PageHeader.vue";
import SideNav from "@/components/SideNav.vue";
import ToastMessage from "@/components/ToastMessage.vue";
import { logout } from "@/config/session";

const route = useRoute();
const router = useRouter();
const confirmOpen = ref(false);
const toast = ref("");
const showTabs = computed(() => !route.meta.hideTabs);
// Public flows (promo onboarding) render without portal chrome.
const bare = computed(() => Boolean(route.meta.bare));

function claimed(message: string) {
  toast.value = message;
  window.setTimeout(() => (toast.value = ""), 2600);
}

</script>

<template>
  <router-view v-if="bare" />
  <div v-else class="flex min-h-dvh flex-col md:pl-64">
    <SideNav @logout="confirmOpen = true" />
    <PageHeader />
    <main
      id="main-content"
      class="flex flex-1 flex-col"
      :class="showTabs ? 'safe-top pb-24 md:pb-10' : 'pb-10'"
    >
      <router-view />
    </main>
    <BottomTabBar v-if="showTabs" />
    <ConfirmDialog :open="confirmOpen" @close="confirmOpen = false" @confirm="logout" />
    <MemberPromoPopup v-if="route.path === '/portal'" @claimed="claimed" />
    <ToastMessage :message="toast" />
  </div>
</template>
