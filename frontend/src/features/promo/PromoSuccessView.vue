<script setup lang="ts">
import { useRouter } from "vue-router";
import AppIcon from "@/components/AppIcon.vue";
import GuideShell from "./components/GuideShell.vue";
import { usePromoFlow } from "./usePromoFlow";

const router = useRouter();
const { state, reset } = usePromoFlow();
if (!state.paid) router.replace("/start/plan");

const timeline = [
  { icon: "check", title: "Today", text: "Your account is created and your first month is paid." },
  { icon: "message", title: "Within 24 hours", text: "We WhatsApp you to confirm your first cut date." },
  { icon: "leaf", title: "First visit", text: "Your crew cuts, then sends before and after photos." },
  { icon: "card", title: "Every month", text: "Same date, same price. Cancel any time." },
] as const;

function toPortal() {
  localStorage.setItem("evergro-new-member", state.details.name.split(" ")[0] || "there");
  reset();
  router.push("/portal");
}
const money = (n: number) => `R${n.toFixed(2)}`;
</script>

<template>
  <GuideShell v-if="state.paid">
    <div class="success-in flex flex-1 flex-col pt-4 pb-2">
      <div class="text-center">
        <span class="relative mx-auto grid size-24 place-items-center">
          <span class="absolute inset-0 animate-ping rounded-full bg-accent/30 [animation-iteration-count:2]" />
          <span class="relative grid size-20 place-items-center rounded-full bg-accent text-primary"><AppIcon name="check" :size="38" /></span>
        </span>
        <h1 class="mt-6 text-4xl leading-[1] font-black tracking-tight uppercase">Payment <span class="text-accent">successful</span></h1>
        <p class="mx-auto mt-3 max-w-xs text-white/70">Welcome to Evergro, {{ state.details.name.split(" ")[0] }}. Your plan is active.</p>
      </div>

      <section class="mt-6 rounded-3xl bg-white p-5 text-primary">
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between"><dt class="text-stone-500">Plan</dt><dd class="font-bold">{{ state.paid.planName }}</dd></div>
          <div class="flex justify-between"><dt class="text-stone-500">Property</dt><dd class="max-w-[60%] text-right font-bold">{{ state.address }}</dd></div>
          <div class="flex justify-between"><dt class="text-stone-500">Reference</dt><dd class="font-bold">{{ state.paid.reference }}</dd></div>
          <div class="flex justify-between"><dt class="text-stone-500">Next payment</dt><dd class="font-bold">{{ money(state.paid.monthly) }} / month</dd></div>
          <div class="flex items-end justify-between border-t border-primary/8 pt-3"><dt class="font-bold">Paid today</dt><dd class="text-2xl font-black">{{ money(state.paid.amount) }}</dd></div>
        </dl>
      </section>

      <section class="mt-5">
        <h2 class="text-lg font-black uppercase">What happens next</h2>
        <ol class="mt-3 space-y-0">
          <li v-for="(item, i) in timeline" :key="item.title" class="flex gap-4">
            <span class="flex flex-col items-center">
              <span class="grid size-9 shrink-0 place-items-center rounded-full" :class="i === 0 ? 'bg-accent text-primary' : 'bg-white/12'"><AppIcon :name="item.icon" :size="16" /></span>
              <span v-if="i < timeline.length - 1" class="my-1 w-0.5 flex-1" :class="i === 0 ? 'bg-accent' : 'bg-white/15'" />
            </span>
            <span class="pb-5"><span class="block font-extrabold">{{ item.title }}</span><span class="block text-sm text-white/65">{{ item.text }}</span></span>
          </li>
        </ol>
      </section>

      <div class="safe-bottom mt-auto pt-4">
        <button type="button" class="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent font-extrabold text-primary shadow-lg shadow-black/20 active:scale-[0.98]" @click="toPortal">Go to my portal<AppIcon name="arrow" :size="18" /></button>
        <p class="mt-3 text-center text-xs text-white/50">Sign in with {{ state.details.email }} any time.</p>
      </div>
    </div>
  </GuideShell>
</template>

<style scoped>
.success-in { animation: success-in 0.5s ease-out; }
@keyframes success-in { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .success-in { animation: none; } }
</style>
