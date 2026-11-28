<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import AppIcon from "@/components/AppIcon.vue";
import { getAnalysisSteps, submitQuoteRequest } from "@/services/api";
import type { PromoStep } from "@/types";
import PromoShell from "./components/PromoShell.vue";
import { usePromoFlow } from "./usePromoFlow";

const router = useRouter();
const { state } = usePromoFlow();
const steps = ref<PromoStep[]>([]);
const current = ref(0);
let timer = 0;

onMounted(async () => {
  steps.value = await getAnalysisSteps();
  await submitQuoteRequest({ ...state });
  timer = window.setInterval(() => {
    if (current.value < steps.value.length) current.value++;
    else {
      window.clearInterval(timer);
      router.replace("/start/quote-requested");
    }
  }, 1100);
});
onBeforeUnmount(() => window.clearInterval(timer));
</script>

<template>
  <PromoShell>
    <div class="mx-auto flex min-h-[calc(100dvh-6rem)] max-w-md flex-col items-center justify-center px-6 text-center">
      <div class="relative grid size-28 place-items-center">
        <span class="absolute inset-0 animate-ping rounded-full bg-accent/40" />
        <span class="absolute inset-3 animate-pulse rounded-full bg-primary/10" />
        <span class="relative grid size-20 place-items-center rounded-full bg-primary text-accent"><AppIcon name="target" :size="34" class="animate-spin [animation-duration:3s]" /></span>
      </div>
      <h1 class="mt-8 text-2xl font-black tracking-tight text-primary">Analysing your yard…</h1>
      <p class="mt-1 text-sm text-stone-500">{{ state.address }}</p>
      <ul class="mt-8 w-full space-y-3 text-left">
        <li v-for="(step, index) in steps" :key="step.id" class="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-bold transition" :class="index <= current ? 'text-primary' : 'text-stone-300'">
          <span class="grid size-6 shrink-0 place-items-center rounded-full" :class="index < current ? 'bg-primary text-white' : index === current ? 'bg-accent text-primary' : 'bg-stone-100'">
            <AppIcon v-if="index < current" name="check" :size="13" />
          </span>{{ step.label }}
        </li>
      </ul>
    </div>
  </PromoShell>
</template>
