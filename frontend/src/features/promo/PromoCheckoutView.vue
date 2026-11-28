<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import AppIcon from "@/components/AppIcon.vue";
import { createAccount, getCampaign, recommendPlans, startSubscription } from "@/services/api";
import type { Campaign, PlanOffer } from "@/types";
import GuideShell from "./components/GuideShell.vue";
import { usePromoFlow } from "./usePromoFlow";

const router = useRouter();
const { state } = usePromoFlow();
const campaign = ref<Campaign>();
const offer = ref<PlanOffer>();
const agreed = ref(false);
const paying = ref(false);
const error = ref("");

onMounted(async () => {
  const [c, rec] = await Promise.all([getCampaign(state.campaign), recommendPlans(state.answers, state.tierId)]);
  campaign.value = c;
  offer.value = rec.offers.find((o) => o.id === state.planId) ?? rec.offers.find((o) => o.id === rec.recommendedId);
});

const money = (n: number) => `R${n.toFixed(2)}`;
const nextMonth = computed(() => offer.value?.monthly ?? 0);
const field = "min-h-12 w-full rounded-2xl border border-primary/12 bg-stone-50 px-4 text-base text-primary outline-none focus:border-primary focus:ring-3 focus:ring-primary/8";

async function subscribe() {
  if (!offer.value) return;
  if (state.password.length < 8) {
    error.value = "Choose a password with at least 8 characters.";
    return;
  }
  error.value = "";
  paying.value = true;
  const [, sub] = await Promise.all([createAccount({ ...state.details }), startSubscription({ ...state })]);
  state.paid = { reference: sub.reference, amount: offer.value.firstMonth, planName: offer.value.name, monthly: offer.value.monthly };
  state.password = "";
  paying.value = false;
  router.replace("/start/success");
}
</script>

<template>
  <GuideShell wide back-to="/start/plan">
    <div v-if="offer && campaign" class="pb-4 md:pb-10">
      <div class="max-w-xl pt-2">
        <p class="text-xs font-extrabold tracking-[0.16em] text-accent uppercase">Last step</p>
        <h1 class="mt-2 text-4xl leading-[1] font-black tracking-tight uppercase md:text-5xl">Start your plan.</h1>
        <p class="mt-3 text-white/65">Create your account and subscribe. Your {{ campaign.name }} is already applied.</p>
      </div>

      <form class="mt-6 grid items-start gap-5 md:grid-cols-[1fr_1fr] md:gap-8" @submit.prevent="subscribe">
        <div class="space-y-5">
          <section class="rounded-3xl bg-white p-5 text-primary">
            <div class="flex items-start justify-between gap-4 border-b border-primary/8 pb-4">
              <div>
                <p class="text-xl font-black">{{ offer.name }}</p>
                <p class="text-sm text-stone-500">{{ offer.cadence === "weekly" ? "Weekly" : "Fortnightly" }} · {{ offer.cutsPerMonth }} cuts a month</p>
              </div>
              <span class="rounded-full bg-accent px-3 py-1 text-xs font-extrabold">{{ campaign.name }}</span>
            </div>
            <ul class="mt-4 flex flex-wrap gap-2">
              <li v-for="inc in offer.includes" :key="inc" class="flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold"><AppIcon name="check" :size="12" />{{ inc }}</li>
            </ul>
            <dl class="mt-5 space-y-3 text-sm">
              <div class="flex justify-between text-stone-600"><dt>Monthly price</dt><dd class="font-semibold text-primary">{{ money(offer.monthly) }}</dd></div>
              <div class="flex justify-between text-emerald-700"><dt>Free cut (25% off month one)</dt><dd class="font-bold">− {{ money(offer.saving) }}</dd></div>
              <div class="flex items-end justify-between border-t border-primary/8 pt-4"><dt class="font-bold">Pay today</dt><dd class="text-3xl font-black tracking-tight">{{ money(offer.firstMonth) }}</dd></div>
            </dl>
            <p class="mt-4 rounded-2xl bg-accent-soft p-3 text-xs leading-5 text-primary/80">From month two you pay {{ money(nextMonth) }} a month on the same date. Cancel any time via WhatsApp, email or call.</p>
          </section>
          <section class="rounded-3xl border border-white/12 bg-white/6 p-5">
            <p class="text-xs font-extrabold tracking-[0.14em] text-accent uppercase">What you get</p>
            <ul class="mt-3 space-y-2 text-sm text-white/85">
              <li v-for="t in ['Insured crew, same team every visit', 'Photos after every visit on WhatsApp', 'Reschedule or cancel with no penalty', 'Your own portal to manage everything']" :key="t" class="flex items-center gap-2.5"><AppIcon name="check" :size="15" class="shrink-0 text-accent" />{{ t }}</li>
            </ul>
          </section>
        </div>

        <div class="space-y-5">
          <section class="rounded-3xl bg-white p-5 text-primary">
            <p class="text-lg font-black">Your account</p>
            <dl class="mt-2 divide-y divide-primary/7 text-sm">
              <div class="flex justify-between gap-4 py-3"><dt class="text-stone-500">Name</dt><dd class="text-right font-bold">{{ state.details.name }}</dd></div>
              <div class="flex justify-between gap-4 py-3"><dt class="text-stone-500">Email</dt><dd class="text-right font-bold break-all">{{ state.details.email }}</dd></div>
              <div class="flex justify-between gap-4 py-3"><dt class="text-stone-500">Property</dt><dd class="text-right font-bold">{{ state.address }}</dd></div>
            </dl>
            <label class="mt-3 block">
              <span class="mb-2 block text-xs font-bold text-primary/60">Create a password</span>
              <input v-model="state.password" required minlength="8" type="password" autocomplete="new-password" placeholder="At least 8 characters" :class="field" />
            </label>
            <p v-if="error" class="mt-2 text-sm font-semibold text-red-600" role="alert">{{ error }}</p>
          </section>

          <section class="rounded-3xl bg-white p-5 text-primary">
            <p class="text-lg font-black">Card details</p>
            <div class="mt-4 grid grid-cols-2 gap-3">
              <label class="col-span-2 block"><span class="mb-2 block text-xs font-bold text-primary/60">Card number</span><input required inputmode="numeric" autocomplete="cc-number" placeholder="1234 5678 9012 3456" :class="field" /></label>
              <label class="block"><span class="mb-2 block text-xs font-bold text-primary/60">Expiry</span><input required autocomplete="cc-exp" placeholder="MM / YY" :class="field" /></label>
              <label class="block"><span class="mb-2 block text-xs font-bold text-primary/60">CVV</span><input required inputmode="numeric" autocomplete="cc-csc" placeholder="123" :class="field" /></label>
            </div>
            <label class="mt-5 flex cursor-pointer items-start gap-3 border-t border-primary/8 pt-5">
              <input v-model="agreed" required type="checkbox" class="mt-0.5 size-5 accent-primary" />
              <span class="text-xs leading-5 text-stone-600">I agree that Evergro will charge <strong class="text-primary">{{ money(offer.firstMonth) }}</strong> today, then <strong class="text-primary">{{ money(nextMonth) }}</strong> monthly until I cancel.</span>
            </label>
            <button type="submit" :disabled="!agreed || paying" class="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary font-extrabold text-white shadow-lg shadow-primary/20 transition active:scale-[0.98] disabled:opacity-50">
              <AppIcon v-if="!paying" name="lock" :size="17" />{{ paying ? "Processing securely…" : `Subscribe · ${money(offer.firstMonth)}` }}
            </button>
            <p class="mt-4 flex items-center justify-center gap-2 text-xs text-stone-400"><AppIcon name="lock" :size="14" />Payments are processed securely by Paystack.</p>
          </section>
        </div>
      </form>
    </div>
  </GuideShell>
</template>
