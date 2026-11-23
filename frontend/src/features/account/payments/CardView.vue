<script setup lang="ts">
import ThumbPage from "@/components/ThumbPage.vue";
import { onMounted, ref } from "vue";
import AppButton from "@/components/AppButton.vue";
import AppCard from "@/components/AppCard.vue";
import ToastMessage from "@/components/ToastMessage.vue";
import { getActiveCard } from "@/services/mockApi";
import type { PaymentCard } from "@/types";
import PaymentCardDisplay from "./PaymentCardDisplay.vue";

const card = ref<PaymentCard>();
const step = ref<"card" | "notice" | "form" | "success">("card");
const toast = ref("");
onMounted(async () => (card.value = await getActiveCard()));
function finish() {
  step.value = "success";
  toast.value = "Your card was updated";
  window.setTimeout(() => (toast.value = ""), 2200);
}
</script>

<template>
  <ThumbPage max-width="max-w-lg">
    <template v-if="step === 'card' && card">
      <PaymentCardDisplay :card="card" />
      <div class="mt-8"><AppButton @click="step = 'notice'">Update card</AppButton></div>
    </template>
    <AppCard v-else-if="step === 'notice'">
      <span class="grid size-12 place-items-center rounded-2xl bg-accent-soft text-primary">R1</span>
      <p class="mt-5 text-xl font-black text-primary">A quick card check</p>
      <p class="mt-2 text-sm leading-6 text-stone-600">We’ll charge R1 to verify your new card. This temporary charge will be reversed automatically.</p>
      <div class="mt-6"><AppButton @click="step = 'form'">Continue</AppButton></div>
    </AppCard>
    <form v-else-if="step === 'form'" @submit.prevent="finish">
      <AppCard>
        <label v-for="field in [{l:'Card number',p:'4242 4242 4242 4242'},{l:'Name on card',p:'THANDI MOKOENA'},{l:'Expiry',p:'MM / YY'},{l:'CVV',p:'•••'}]" :key="field.l" class="mb-4 block last:mb-0">
          <span class="mb-2 block text-sm font-bold text-primary">{{ field.l }}</span>
          <input required :placeholder="field.p" class="min-h-12 w-full rounded-2xl border border-primary/12 bg-stone-50 px-4 outline-none focus:border-primary" />
        </label>
      </AppCard>
      <div class="mt-6"><AppButton type="submit">Verify and update</AppButton></div>
    </form>
    <AppCard v-else class="text-center">
      <span class="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-2xl font-black text-emerald-700">✓</span>
      <p class="mt-5 text-xl font-black text-primary">Card updated</p>
      <p class="mt-2 text-sm text-stone-500">Your new card is ready for future payments.</p>
      <div class="mt-6"><AppButton @click="step = 'card'">Done</AppButton></div>
    </AppCard>
    <ToastMessage :message="toast" />
  </ThumbPage>
</template>
