<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import AppIcon from "@/components/AppIcon.vue";
import { getGuideQuestions, getHouseLayouts, getPricing } from "@/services/api";
import type { GuideQuestion, HouseLayout, PricingTier, ZoneId } from "@/types";
import GuideShell from "./components/GuideShell.vue";
import PlotDiagram from "./components/PlotDiagram.vue";
import { usePromoFlow } from "./usePromoFlow";

const router = useRouter();
const { state } = usePromoFlow();
const questions = ref<GuideQuestion[]>([]);
const tiers = ref<PricingTier[]>([]);
const layouts = ref<HouseLayout[]>([]);
const index = ref(0);
const picked = ref("");

onMounted(async () => {
  const [q, pricing, l] = await Promise.all([getGuideQuestions(), getPricing(), getHouseLayouts()]);
  questions.value = q;
  tiers.value = pricing.tiers;
  layouts.value = l;
});

const question = computed(() => questions.value[index.value]);
const layout = computed(() => layouts.value.find((item) => item.id === state.layoutId) ?? layouts.value[0]);
const tierIndex = computed(() => tiers.value.findIndex((tier) => tier.id === state.tierId));
const included = computed<ZoneId[]>(() => tiers.value.slice(0, tierIndex.value + 1).map((tier) => tier.zone));
const tier = computed(() => tiers.value[tierIndex.value]);

function pickZone(zone: ZoneId) {
  const match = tiers.value.find((item) => item.zone === zone);
  if (match) state.tierId = match.id;
}

function advance() {
  if (index.value < questions.value.length - 1) {
    index.value++;
    picked.value = "";
    window.scrollTo({ top: 0 });
  } else router.push("/start/plan");
}

function choose(id: string) {
  picked.value = id;
  state.answers[question.value.id] = id;
  // Short pause so the selection registers before moving on.
  window.setTimeout(() => picked.value === id && advance(), 260);
}

function back() {
  if (index.value > 0) index.value--;
  else router.push("/start/details");
}
</script>

<template>
  <GuideShell :step="index + 1" :steps="questions.length">
    <template #back>
      <button type="button" class="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 hover:bg-white/15" aria-label="Back" @click="back"><AppIcon name="back" :size="20" /></button>
    </template>

    <div v-if="question" :key="question.id" class="guide-step flex flex-1 flex-col pt-4">
      <p class="text-xs font-extrabold tracking-[0.16em] text-accent uppercase">Question {{ index + 1 }} of {{ questions.length }}</p>
      <h1 class="mt-2 text-3xl leading-[1.05] font-black tracking-tight uppercase">{{ question.title }}</h1>
      <p class="mt-2 text-white/65">{{ question.subtitle }}</p>

      <div v-if="question.kind === 'options'" class="mt-6 space-y-3" role="radiogroup" :aria-label="question.title">
        <button
          v-for="option in question.options"
          :key="option.id"
          type="button"
          role="radio"
          :aria-checked="(picked || state.answers[question.id]) === option.id"
          class="flex min-h-16 w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition active:scale-[0.99]"
          :class="(picked || state.answers[question.id]) === option.id ? 'border-accent bg-accent text-primary' : 'border-white/15 bg-white/7 hover:bg-white/12'"
          @click="choose(option.id)"
        >
          <span class="min-w-0 flex-1">
            <span class="block font-extrabold">{{ option.label }}</span>
            <span v-if="option.hint" class="block text-sm" :class="(picked || state.answers[question.id]) === option.id ? 'text-primary/70' : 'text-white/55'">{{ option.hint }}</span>
          </span>
          <span class="grid size-7 shrink-0 place-items-center rounded-full border-2" :class="(picked || state.answers[question.id]) === option.id ? 'border-primary bg-primary text-accent' : 'border-white/30'">
            <AppIcon v-if="(picked || state.answers[question.id]) === option.id" name="check" :size="14" />
          </span>
        </button>
      </div>

      <div v-else-if="layout" class="mt-6">
        <div class="rounded-3xl bg-white p-3 text-primary">
          <PlotDiagram :layout="layout" :included="included" interactive labels @select="pickZone" />
          <div class="mt-3 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Areas to cut">
            <button v-for="item in tiers" :key="item.id" type="button" role="radio" :aria-checked="state.tierId === item.id" class="min-h-12 rounded-xl border px-2 text-sm font-extrabold transition" :class="state.tierId === item.id ? 'border-primary bg-primary text-white' : 'border-primary/12 hover:bg-primary-soft'" @click="state.tierId = item.id">{{ item.name }}</button>
          </div>
          <p v-if="tier" class="mt-3 flex items-center gap-2 px-1 text-sm text-stone-600"><AppIcon name="leaf" :size="16" class="shrink-0 text-primary" />{{ tier.description }}</p>
        </div>
      </div>

      <!-- Education -->
      <section class="mt-6 rounded-2xl border border-white/12 bg-white/6 p-4">
        <p class="flex items-center gap-2 text-xs font-extrabold tracking-[0.14em] text-accent uppercase"><AppIcon name="spark" :size="14" />Why we ask</p>
        <p class="mt-2 text-sm leading-6 text-white/80">{{ question.why }}</p>
      </section>
      <section class="mt-3 flex gap-3 rounded-2xl bg-accent p-4 text-primary">
        <span class="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-accent"><AppIcon name="shield" :size="18" /></span>
        <div>
          <p class="font-black">{{ question.edge.title }}</p>
          <p class="mt-0.5 text-sm leading-5 text-primary/75">{{ question.edge.text }}</p>
        </div>
      </section>

      <div class="safe-bottom mt-auto pt-6">
        <button v-if="question.kind === 'areas' || state.answers[question.id]" type="button" class="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent font-extrabold text-primary shadow-lg shadow-black/20 active:scale-[0.98]" @click="advance">
          {{ index === questions.length - 1 ? "Build my plan" : "Continue" }}<AppIcon name="arrow" :size="18" />
        </button>
      </div>
    </div>
  </GuideShell>
</template>

<style scoped>
.guide-step {
  animation: step-in 0.35s ease-out;
}
@keyframes step-in {
  from { opacity: 0; transform: translateX(18px); }
  to { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .guide-step { animation: none; }
}
</style>
