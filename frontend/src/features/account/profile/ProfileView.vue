<script setup lang="ts">
import ThumbPage from "@/components/ThumbPage.vue";
import { onMounted, ref } from "vue";
import AppButton from "@/components/AppButton.vue";
import AppCard from "@/components/AppCard.vue";
import ToastMessage from "@/components/ToastMessage.vue";
import { getCustomer, updateCustomer } from "@/services/api";
import type { Customer } from "@/types";

const customer = ref<Customer>();
const saving = ref(false);
const toast = ref("");
const fields = [
  { key: "name", label: "Full name", type: "text" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone", type: "tel" },
  { key: "birthday", label: "Birthday", type: "date" },
] as const;
onMounted(async () => (customer.value = await getCustomer()));
async function save() {
  if (!customer.value) return;
  saving.value = true;
  customer.value = await updateCustomer(customer.value);
  saving.value = false;
  toast.value = "Profile saved";
  window.setTimeout(() => (toast.value = ""), 2000);
}
</script>

<template>
  <ThumbPage v-if="customer"><form @submit.prevent="save">
    <AppCard>
      <div class="space-y-5">
        <label v-for="field in fields" :key="field.key" class="block">
          <span class="mb-2 block text-sm font-bold text-primary">{{ field.label }}</span>
          <input v-model="customer[field.key]" :type="field.type" class="min-h-12 w-full rounded-2xl border border-primary/12 bg-stone-50 px-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/8" />
        </label>
      </div>
    </AppCard>
    <div class="sticky bottom-0 mt-6 bg-[#f7f9f7]/90 py-4 backdrop-blur md:static md:bg-transparent">
      <AppButton type="submit" :disabled="saving">{{ saving ? "Saving…" : "Save changes" }}</AppButton>
    </div>
    <ToastMessage :message="toast" />
  </form></ThumbPage>
</template>
