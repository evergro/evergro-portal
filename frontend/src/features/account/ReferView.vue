<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import AppCard from "@/components/AppCard.vue";
import AppIcon from "@/components/AppIcon.vue";
import ThumbPage from "@/components/ThumbPage.vue";
import ToastMessage from "@/components/ToastMessage.vue";
import { getReferral } from "@/services/api";
import type { ReferralSummary } from "@/types";

const referral = ref<ReferralSummary>();
const toast = ref("");

onMounted(async () => (referral.value = await getReferral()));

const signedUp = computed(() => referral.value?.referrals.filter((r) => r.status === "Signed up").length ?? 0);
const remaining = computed(() => Math.max(0, (referral.value?.goal ?? 0) - signedUp.value));
const earned = computed(() => signedUp.value * (referral.value?.rewardPerReferral ?? 0));
const RADIUS = 52;
const circumference = 2 * Math.PI * RADIUS;
const dash = computed(() => circumference * Math.min(1, signedUp.value / (referral.value?.goal || 1)));

function flash(message: string) {
  toast.value = message;
  window.setTimeout(() => (toast.value = ""), 2000);
}
async function copy() {
  await navigator.clipboard?.writeText(referral.value?.code ?? "");
  flash("Referral code copied");
}
async function share() {
  if (!referral.value) return;
  if (navigator.share) await navigator.share({ title: "Evergro Landscapers", url: `https://${referral.value.url}` });
  else {
    await navigator.clipboard?.writeText(referral.value.url);
    flash("Referral link copied");
  }
}
</script>

<template>
  <ThumbPage v-if="referral" max-width="max-w-xl">
    <div class="space-y-4">
      <AppCard class="text-center">
        <p class="text-xs font-bold tracking-widest text-primary/45 uppercase">Your referral progress</p>
        <div class="relative mx-auto mt-4 size-36">
          <svg viewBox="0 0 128 128" class="size-full -rotate-90">
            <circle cx="64" cy="64" :r="RADIUS" fill="none" class="stroke-primary-soft" stroke-width="12" />
            <circle cx="64" cy="64" :r="RADIUS" fill="none" class="stroke-primary transition-all duration-700" stroke-width="12" stroke-linecap="round" :stroke-dasharray="`${dash} ${circumference}`" />
          </svg>
          <div class="absolute inset-0 grid place-content-center">
            <p class="text-4xl font-black text-primary">{{ signedUp }}</p>
            <p class="text-xs text-primary/50">of {{ referral.goal }}</p>
          </div>
        </div>
        <p class="mt-4 font-extrabold text-primary">{{ remaining ? `${remaining} more to unlock R${referral.bonus} bonus` : `You unlocked your R${referral.bonus} bonus!` }}</p>
        <p class="mt-1 text-xs text-stone-500">Each successful referral earns you R{{ referral.rewardPerReferral }}</p>
        <div class="mt-5 grid grid-cols-3 border-t border-primary/8 pt-4 text-center">
          <div><p class="font-black text-primary">R{{ earned }}</p><p class="text-xs text-stone-500">Earned</p></div>
          <div><p class="font-black text-primary">{{ signedUp }}</p><p class="text-xs text-stone-500">Referrals</p></div>
          <div><p class="font-black text-primary">R{{ referral.rewardPerReferral }}</p><p class="text-xs text-stone-500">Next reward</p></div>
        </div>
      </AppCard>

      <div>
        <p class="mb-2 px-1 text-xs font-bold tracking-widest text-primary/45 uppercase">People you’ve referred</p>
        <AppCard class="!py-1">
          <div v-for="person in referral.referrals" :key="person.name" class="flex min-h-16 items-center gap-3 border-b border-stone-100 py-3 last:border-0">
            <span class="grid size-10 place-items-center rounded-full bg-primary-soft text-sm font-black text-primary">{{ person.name[0] }}</span>
            <div class="flex-1"><p class="font-bold text-primary">{{ person.name }}</p><p class="text-xs text-stone-500">{{ person.month }}</p></div>
            <div class="text-right">
              <span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="person.status === 'Signed up' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'">{{ person.status }}</span>
              <p class="mt-1 text-xs font-bold text-primary">R{{ person.reward }}</p>
            </div>
          </div>
        </AppCard>
      </div>

      <div class="rounded-3xl bg-primary-soft p-4">
        <p class="text-xs font-bold tracking-widest text-primary/45 uppercase">Your referral code</p>
        <div class="mt-2 flex gap-2">
          <p class="flex min-h-12 flex-1 items-center rounded-2xl bg-white px-4 font-mono font-bold tracking-wider text-primary">{{ referral.code }}</p>
          <button type="button" class="grid size-12 place-items-center rounded-2xl bg-primary text-white" aria-label="Copy code" @click="copy"><AppIcon name="copy" :size="18" /></button>
        </div>
        <p class="mt-2 text-xs text-stone-500">Share this code and your friend gets R{{ referral.rewardPerReferral }} off their first visit.</p>
      </div>
      <button type="button" class="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent font-extrabold text-primary active:scale-[0.98]" @click="share"><AppIcon name="arrow" :size="18" />Share your referral link</button>
    </div>
    <ToastMessage :message="toast" />
  </ThumbPage>
</template>
