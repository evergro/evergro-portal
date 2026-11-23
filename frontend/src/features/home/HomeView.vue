<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import AppButton from "@/components/AppButton.vue";
import AppCard from "@/components/AppCard.vue";
import AppIcon from "@/components/AppIcon.vue";
import BeforeAfter from "@/components/BeforeAfter.vue";
import PromoBanner from "@/features/promo/components/PromoBanner.vue";
import StatusBadge from "@/components/StatusBadge.vue";
import { getCustomer, getLastVisit, getNextVisit } from "@/services/mockApi";
import type { Customer, Visit } from "@/types";

const customer = ref<Customer>();
const nextVisit = ref<Visit>();
const lastVisit = ref<Visit>();
// Set by the onboarding success page for brand-new members.
const newMember = ref(localStorage.getItem("evergro-new-member"));
const checklist = ref([
  { id: "account", label: "Account created", done: true, to: "/portal/account/profile" },
  { id: "notify", label: "Choose how we contact you", done: false, to: "/portal/account/notifications" },
  { id: "photos", label: "Add gate or access notes", done: false, to: "/portal/account/properties" },
  { id: "card", label: "Review your payment card", done: false, to: "/portal/account/payments" },
]);
const progress = computed(() => Math.round((checklist.value.filter((i) => i.done).length / checklist.value.length) * 100));
function dismissWelcome() {
  localStorage.removeItem("evergro-new-member");
  newMember.value = null;
}

onMounted(async () => {
  [customer.value, nextVisit.value, lastVisit.value] = await Promise.all([
    getCustomer(),
    getNextVisit(),
    getLastVisit(),
  ]);
});
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 pt-8 md:px-8 md:pt-10">
    <div v-if="customer" class="mb-7 flex items-center justify-between">
      <div>
        <p class="text-sm font-bold text-primary/50">Good morning</p>
        <h1 class="mt-1 text-3xl font-black tracking-tight text-primary md:text-4xl">Hi {{ customer.name.split(" ")[0] }}</h1>
      </div>
      <span class="grid size-12 place-items-center rounded-full bg-primary text-sm font-bold text-white md:hidden">{{ customer.avatar }}</span>
    </div>

    <AppCard v-if="newMember" class="mb-5 !border-0 !bg-primary text-white">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs font-extrabold tracking-[0.16em] text-accent uppercase">Welcome, {{ newMember }}</p>
          <p class="mt-1 text-xl font-black">Finish setting up your account</p>
        </div>
        <button type="button" class="grid size-11 shrink-0 place-items-center rounded-full bg-white/10" aria-label="Dismiss" @click="dismissWelcome"><AppIcon name="close" :size="18" /></button>
      </div>
      <div class="mt-4 h-2 overflow-hidden rounded-full bg-white/15"><div class="h-full rounded-full bg-accent transition-all duration-700" :style="{ width: `${progress}%` }" /></div>
      <ul class="mt-3 divide-y divide-white/10">
        <li v-for="item in checklist" :key="item.id">
          <router-link :to="item.to" class="flex min-h-12 items-center gap-3 text-sm font-bold">
            <span class="grid size-6 place-items-center rounded-full" :class="item.done ? 'bg-accent text-primary' : 'border-2 border-white/30'"><AppIcon v-if="item.done" name="check" :size="13" /></span>
            <span class="flex-1" :class="item.done ? 'text-white/60' : ''">{{ item.label }}</span>
            <AppIcon v-if="!item.done" name="chevron" :size="16" class="text-white/50" />
          </router-link>
        </li>
      </ul>
    </AppCard>

    <PromoBanner />

    <AppCard v-if="nextVisit?.reason" class="mb-5 !border-accent/50 !bg-accent-soft">
      <div class="flex gap-3">
        <span class="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-primary"><AppIcon name="clock" :size="19" /></span>
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <p class="font-extrabold text-primary">Your visit was rescheduled</p>
            <StatusBadge status="Rescheduled" />
          </div>
          <p class="mt-1 text-sm leading-6 text-primary/70">{{ nextVisit.reason }} Your new visit is {{ nextVisit.newDate }}.</p>
        </div>
      </div>
    </AppCard>

    <div class="grid gap-5 md:grid-cols-2">
      <AppCard v-if="nextVisit" class="overflow-hidden !border-0 !bg-gradient-to-br !from-primary !to-emerald-900 text-white">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs font-bold tracking-widest text-white/55 uppercase">Next visit</p>
            <p class="mt-4 text-2xl font-black">{{ nextVisit.newDate || nextVisit.date }}</p>
            <p class="mt-1 text-sm text-white/70">{{ nextVisit.timeWindow }}</p>
          </div>
          <span class="grid size-11 place-items-center rounded-2xl bg-white/10"><AppIcon name="calendar" /></span>
        </div>
        <div class="mt-7 border-t border-white/12 pt-5">
          <p class="font-bold">{{ nextVisit.service }}</p>
          <p class="mt-1 text-sm leading-6 text-white/60">{{ nextVisit.property }}</p>
        </div>
      </AppCard>

      <AppCard class="relative overflow-hidden !bg-accent-soft">
        <div class="absolute -top-8 -right-7 size-28 rounded-full bg-accent/35" />
        <span class="grid size-11 place-items-center rounded-2xl bg-accent text-primary"><AppIcon name="gift" /></span>
        <p class="mt-5 text-xl font-black text-primary">Good gardens grow together.</p>
        <p class="mt-2 text-sm leading-6 text-primary/65">Share Evergro with a friend and you’ll both get R250 off.</p>
        <router-link to="/portal/account/refer" class="mt-5 block">
          <AppButton>Refer a friend</AppButton>
        </router-link>
      </AppCard>
    </div>

    <AppCard v-if="lastVisit" class="mt-5">
      <div class="mb-4 flex items-end justify-between gap-4">
        <div>
          <p class="text-xs font-bold tracking-widest text-primary/45 uppercase">Last visit</p>
          <p class="mt-1 text-lg font-extrabold text-primary">{{ lastVisit.date }}</p>
        </div>
        <StatusBadge :status="lastVisit.status" />
      </div>
      <BeforeAfter :before="lastVisit.beforePhoto!" :after="lastVisit.afterPhoto!" />
      <p class="mt-4 text-sm leading-6 text-stone-600">{{ lastVisit.summary }}</p>
    </AppCard>
  </div>
</template>
