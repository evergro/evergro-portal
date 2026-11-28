<script setup lang="ts">
import ThumbPage from "@/components/ThumbPage.vue";
import { onMounted, ref } from "vue";
import AppCard from "@/components/AppCard.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import ListRow from "@/components/ListRow.vue";
import ToastMessage from "@/components/ToastMessage.vue";
import { useProfile } from "@/data/useProfile";
import AsyncState from "@/components/AsyncState.vue";
import UserAvatar from "@/components/UserAvatar.vue";
import type { Customer } from "@/types";
import { logout } from "@/config/session";

const customer = useProfile();
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

</script>

<template>
  <ThumbPage max-width="max-w-3xl">
    <template #top>
    <AsyncState :resource="customer">
      <div v-if="customer.data" class="flex items-center gap-4">
        <UserAvatar :avatar="customer.data.avatar" :image="customer.data.image" class="size-20 rounded-3xl text-xl font-black shadow-lg shadow-primary/15" />
        <div>
          <h1 class="text-2xl font-black tracking-tight text-primary md:text-3xl">{{ customer.data.name }}</h1>
          <p class="mt-1 text-sm text-stone-500">Evergro customer since {{ customer.data.since }}</p>
        </div>
      </div>
    </AsyncState>
    </template>
    <AppCard class="!py-1">
      <ListRow v-for="row in rows" :key="row.to" v-bind="row" />
      <div class="md:hidden"><ListRow label="Log out" icon="logout" danger @click="confirmOpen = true" /></div>
    </AppCard>
    <ConfirmDialog :open="confirmOpen" @close="confirmOpen = false" @confirm="logout" />
    <ToastMessage :message="toast" />
  </ThumbPage>
</template>
