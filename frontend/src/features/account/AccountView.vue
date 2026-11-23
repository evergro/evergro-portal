<script setup lang="ts">
import ThumbPage from "@/components/ThumbPage.vue";
import { onMounted, ref } from "vue";
import AppCard from "@/components/AppCard.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import ListRow from "@/components/ListRow.vue";
import ToastMessage from "@/components/ToastMessage.vue";
import { getCustomer } from "@/services/mockApi";
import type { Customer } from "@/types";

const customer = ref<Customer>();
const confirmOpen = ref(false);
const toast = ref("");
const rows = [
  { label: "Your Profile", icon: "user", to: "/portal/account/profile" },
  { label: "Change your password", icon: "lock", to: "/portal/account/password" },
  { label: "Your Payments", icon: "card", to: "/portal/account/payments" },
  { label: "Refer a friend", icon: "gift", to: "/portal/account/refer" },
  { label: "My Properties", icon: "map", to: "/portal/account/properties" },
  { label: "Notification Settings", icon: "bell", to: "/portal/account/notifications" },
];

onMounted(async () => (customer.value = await getCustomer()));
function logout() {
  confirmOpen.value = false;
  sessionStorage.clear();
  toast.value = "You’ve been logged out";
  window.setTimeout(() => (toast.value = ""), 2200);
}
</script>

<template>
  <ThumbPage max-width="max-w-3xl">
    <template #top>
    <div v-if="customer" class="flex items-center gap-4">
      <span class="grid size-20 place-items-center rounded-3xl bg-primary text-xl font-black text-white shadow-lg shadow-primary/15">{{ customer.avatar }}</span>
      <div>
        <h1 class="text-2xl font-black tracking-tight text-primary md:text-3xl">{{ customer.name }}</h1>
        <p class="mt-1 text-sm text-stone-500">Evergro customer since {{ customer.since }}</p>
      </div>
    </div>
    </template>
    <AppCard class="!py-1">
      <ListRow v-for="row in rows" :key="row.to" v-bind="row" />
      <div class="md:hidden"><ListRow label="Log out" icon="logout" danger @click="confirmOpen = true" /></div>
    </AppCard>
    <ConfirmDialog :open="confirmOpen" @close="confirmOpen = false" @confirm="logout" />
    <ToastMessage :message="toast" />
  </ThumbPage>
</template>
