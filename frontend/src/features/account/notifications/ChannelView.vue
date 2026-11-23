<script setup lang="ts">
import ThumbPage from "@/components/ThumbPage.vue";
import { onMounted, ref } from "vue";
import AppCard from "@/components/AppCard.vue";
import ToastMessage from "@/components/ToastMessage.vue";
import ToggleSwitch from "@/components/ToggleSwitch.vue";
import { getNotificationSettings, saveNotificationSettings } from "@/services/mockApi";
import type { NotificationSettings } from "@/types";
defineProps<{ channel: string }>();
const settings = ref<NotificationSettings>();
const toast = ref("");
const labels: { key: keyof NotificationSettings; label: string }[] = [
  { key: "reminders", label: "Visit reminders" },
  { key: "completed", label: "Visit completed" },
  { key: "invoices", label: "Invoices and payments" },
  { key: "promotions", label: "Promotions" },
  { key: "referrals", label: "Referral updates" },
];
onMounted(async () => (settings.value = await getNotificationSettings()));
async function save() {
  if (!settings.value) return;
  await saveNotificationSettings(settings.value);
  toast.value = "Preference saved";
  window.setTimeout(() => (toast.value = ""), 1600);
}
</script>

<template>
  <ThumbPage>
    <p class="mb-4 text-sm leading-6 text-stone-500">Choose which updates you’d like to receive by {{ channel }}.</p>
    <AppCard v-if="settings" class="!py-1">
      <ToggleSwitch v-for="item in labels" :key="item.key" v-model="settings[item.key]" :label="item.label" @change="save" />
    </AppCard>
    <ToastMessage :message="toast" />
  </ThumbPage>
</template>
