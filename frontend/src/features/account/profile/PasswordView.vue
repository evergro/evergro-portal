<script setup lang="ts">
import ThumbPage from "@/components/ThumbPage.vue";
import { ref } from "vue";
import AppButton from "@/components/AppButton.vue";
import AppCard from "@/components/AppCard.vue";
import ToastMessage from "@/components/ToastMessage.vue";
const fields = ref({ current: "", password: "", confirm: "" });
const toast = ref("");
function save() {
  toast.value = fields.value.password === fields.value.confirm ? "Password updated" : "Passwords don’t match";
  window.setTimeout(() => (toast.value = ""), 2200);
}
</script>

<template>
  <ThumbPage><form @submit.prevent="save">
    <AppCard>
      <label v-for="(label, key) in { current: 'Current password', password: 'New password', confirm: 'Confirm new password' }" :key="key" class="mb-5 block last:mb-0">
        <span class="mb-2 block text-sm font-bold text-primary">{{ label }}</span>
        <input v-model="fields[key]" type="password" required minlength="6" class="min-h-12 w-full rounded-2xl border border-primary/12 bg-stone-50 px-4 outline-none focus:border-primary focus:ring-3 focus:ring-primary/8" />
      </label>
    </AppCard>
    <div class="sticky bottom-0 mt-6 bg-[#f7f9f7]/90 py-4 backdrop-blur md:static md:bg-transparent"><AppButton type="submit">Save password</AppButton></div>
    <ToastMessage :message="toast" />
  </form></ThumbPage>
</template>
