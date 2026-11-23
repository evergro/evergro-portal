<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import AppIcon from "@/components/AppIcon.vue";
import { getCampaign, recommendPlans } from "@/services/promoApi";
import type { Campaign, PlanRecommendation } from "@/types";
import AnimatedPrice from "./components/AnimatedPrice.vue";
import GuideShell from "./components/GuideShell.vue";
import { usePromoFlow } from "./usePromoFlow";

const router = useRouter();
const { state } = usePromoFlow();
const result = ref<PlanRecommendation>();
const campaign = ref<Campaign>();
const building = ref(true);
const stage = ref(0);
const stages = ["Reading your answers", "Matching cut frequency", "Checking weed and bed needs", "Preparing your offers"];
const selected = ref("");
let timer = 0;

onMounted(async () => {
  [result.value, campaign.value] = await Promise.all([recommendPlans(state.answers, state.tierId), getCampaign(state.campaign)]);
  selected.value = state.planId && result.value.offers.some((o) => o.id === state.planId) ? state.planId : result.value.recommendedId;
  timer = window.setInterval(() => {
    if (stage.value < stages.length - 1) stage.value++;
    else {
      window.clearInterval(timer);
      building.value = false;
    }
  }, 700);
});
onBeforeUnmount(() => window.clearInterval(timer));

function choose() {
  state.planId = selected.value;
  router.push("/start/checkout");
}
const cadenceLabel = (c: string) => (c === "weekly" ? "Weekly cuts" : "Fortnightly cuts");
</script>

<template>
  <GuideShell wide back-to="/start/guide">
    <!-- Building -->
    <div v-if="building" class="mx-auto flex flex-1 max-w-sm flex-col items-center justify-center text-center">
      <div class="relative grid size-28 place-items-center">
        <span class="absolute inset-0 animate-ping rounded-full bg-accent/30" />
        <span class="relative grid size-20 place-items-center rounded-full bg-accent text-primary"><AppIcon name="leaf" :size="34" class="animate-pulse" /></span>
      </div>
      <h1 class="mt-8 text-2xl font-black tracking-tight uppercase">Building your plan</h1>
      <ul class="mt-6 w-full space-y-2.5 text-left">
        <li v-for="(label, i) in stages" :key="label" class="flex items-center gap-3 text-sm font-bold transition" :class="i <= stage ? 'text-white' : 'text-white/25'">
          <span class="grid size-6 shrink-0 place-items-center rounded-full" :class="i < stage ? 'bg-accent text-primary' : i === stage ? 'bg-white/20' : 'bg-white/8'"><AppIcon v-if="i < stage" name="check" :size="13" /></span>{{ label }}
        </li>
      </ul>
    </div>

    <!-- Offers -->
    <div v-else-if="result" class="plan-in pb-32 md:pb-10">
      <div class="max-w-xl pt-2">
        <p class="text-xs font-extrabold tracking-[0.16em] text-accent uppercase">Your tailored offer</p>
        <h1 class="mt-2 text-4xl leading-[1] font-black tracking-tight uppercase md:text-5xl">Here is what your lawn needs.</h1>
        <p class="mt-3 text-white/65">Based on your answers, we recommend the plan below. You can pick a lighter or fuller one, and change it any time.</p>
      </div>

      <section class="mt-6 rounded-3xl border border-white/12 bg-white/6 p-5">
        <p class="text-xs font-extrabold tracking-[0.14em] text-accent uppercase">Why this plan</p>
        <ul class="mt-3 grid gap-2.5 md:grid-cols-2">
          <li v-for="reason in result.reasons" :key="reason" class="flex gap-3 text-sm leading-6 text-white/85">
            <span class="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent text-primary"><AppIcon name="check" :size="12" /></span>{{ reason }}
          </li>
        </ul>
      </section>

      <div class="mt-6 grid gap-4 md:grid-cols-3 md:items-stretch" role="radiogroup" aria-label="Plans">
        <button
          v-for="offer in result.offers"
          :key="offer.id"
          type="button"
          role="radio"
          :aria-checked="selected === offer.id"
          class="relative flex flex-col rounded-3xl border p-5 text-left transition active:scale-[0.99]"
          :class="[
            selected === offer.id ? 'border-accent bg-white text-primary ring-2 ring-accent' : 'border-white/15 bg-white/7 hover:bg-white/12',
            offer.id === result.recommendedId ? 'md:-my-3 md:py-8' : '',
          ]"
          @click="selected = offer.id"
        >
          <span v-if="offer.id === result.recommendedId" class="absolute -top-3 left-5 rounded-full bg-accent px-3 py-1 text-xs font-extrabold text-primary shadow">Recommended for you</span>
          <span class="flex items-start justify-between gap-3">
            <span>
              <span class="block text-xl font-black">{{ offer.name }}</span>
              <span class="block text-sm" :class="selected === offer.id ? 'text-stone-500' : 'text-white/55'">{{ offer.tagline }}</span>
            </span>
            <span class="grid size-7 shrink-0 place-items-center rounded-full border-2" :class="selected === offer.id ? 'border-primary bg-primary text-accent' : 'border-white/30'"><AppIcon v-if="selected === offer.id" name="check" :size="14" /></span>
          </span>
          <span class="mt-5 block text-4xl font-black tracking-tight"><AnimatedPrice :value="offer.monthly" /><span class="text-sm font-bold" :class="selected === offer.id ? 'text-primary/45' : 'text-white/50'"> /month</span></span>
          <span class="mt-1 block text-sm font-bold" :class="selected === offer.id ? 'text-emerald-700' : 'text-accent'">First month R{{ offer.firstMonth }} with {{ campaign?.name }}</span>
          <span class="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold" :class="selected === offer.id ? 'bg-primary-soft text-primary' : 'bg-white/12'"><AppIcon name="calendar" :size="12" />{{ cadenceLabel(offer.cadence) }} · {{ offer.cutsPerMonth }} a month</span>
          <span class="mt-4 block space-y-2 border-t pt-4" :class="selected === offer.id ? 'border-primary/10' : 'border-white/12'">
            <span v-for="item in offer.includes" :key="item" class="flex items-center gap-2 text-sm"><AppIcon name="check" :size="14" class="shrink-0" :class="selected === offer.id ? 'text-primary' : 'text-accent'" />{{ item }}</span>
          </span>
        </button>
      </div>

      <section class="mt-8 grid gap-3 md:grid-cols-3">
        <div v-for="item in [
          { t: 'Why not a one-off gardener?', d: 'No call-outs, no no-shows. Your visits are scheduled and photographed.' },
          { t: 'Why not DIY?', d: 'Get your weekends back. Our crew brings the equipment and takes the waste.' },
          { t: 'Why Evergro?', d: 'Insured, same crew each time, and cancel any time with no contract.' },
        ]" :key="item.t" class="rounded-2xl bg-accent p-4 text-primary">
          <p class="font-black">{{ item.t }}</p>
          <p class="mt-1 text-sm leading-5 text-primary/75">{{ item.d }}</p>
        </div>
      </section>

      <div class="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-primary/95 px-4 pt-3 backdrop-blur-xl md:static md:mt-8 md:border-0 md:bg-transparent md:px-0">
        <div class="mx-auto flex max-w-5xl flex-col gap-2 md:flex-row md:items-center md:justify-end md:gap-5">
          <p class="text-sm text-white/70">Free cut applied to your first month. Cancel any time.</p>
          <button type="button" class="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-accent px-8 font-extrabold text-primary shadow-lg shadow-black/20 active:scale-[0.98] md:min-w-64" @click="choose">Choose this plan<AppIcon name="arrow" :size="18" /></button>
        </div>
      </div>
    </div>
  </GuideShell>
</template>

<style scoped>
.plan-in { animation: plan-in 0.5s ease-out; }
@keyframes plan-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .plan-in { animation: none; } }
</style>
