<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import AppButton from "@/components/AppButton.vue";
import AppIcon from "@/components/AppIcon.vue";
import { getHouseLayouts } from "@/services/api";
import type { HouseLayout } from "@/types";
import PlotDiagram from "./components/PlotDiagram.vue";
import PromoShell from "./components/PromoShell.vue";
import { usePromoFlow } from "./usePromoFlow";

const router = useRouter();
const { state } = usePromoFlow();
const layouts = ref<HouseLayout[]>([]);
const section = ref<1 | 2>(1);
const error = ref("");

const fields = [
  { key: "name", label: "Full name", type: "text", auto: "name" },
  { key: "phone", label: "WhatsApp number", type: "tel", auto: "tel" },
  { key: "email", label: "Email address", type: "email", auto: "email" },
] as const;

onMounted(async () => (layouts.value = await getHouseLayouts()));

function next() {
  section.value = 2;
}

function submit() {
  if (!state.layoutId) {
    error.value = "Pick the layout that looks most like your home.";
    return;
  }
  router.push(state.addressClass === "quote" ? "/start/analysing" : "/start/guide");
}
</script>

<template>
  <PromoShell :step="2" :steps="3">
    <!-- Blurred preview of the checkout the customer is heading towards -->
    <div class="pointer-events-none mx-auto max-w-5xl px-4 pt-8 blur-md select-none md:px-8 md:pt-12" aria-hidden="true">
      <div class="h-8 w-56 rounded-xl bg-primary/20" />
      <div class="mt-6 grid gap-5 md:grid-cols-2">
        <div class="card-shadow space-y-4 rounded-3xl bg-white p-6">
          <div class="h-5 w-40 rounded-lg bg-primary/20" />
          <div v-for="n in 4" :key="n" class="flex justify-between"><div class="h-4 w-32 rounded bg-stone-200" /><div class="h-4 w-16 rounded bg-primary/25" /></div>
          <div class="h-12 rounded-2xl bg-primary/80" />
        </div>
        <div class="card-shadow space-y-4 rounded-3xl bg-white p-6">
          <div class="h-5 w-32 rounded-lg bg-primary/20" />
          <div v-for="n in 3" :key="n" class="h-12 rounded-2xl bg-stone-100" />
          <div class="h-12 rounded-2xl bg-accent" />
        </div>
      </div>
    </div>

    <div class="fixed inset-0 z-40 flex items-end justify-center bg-primary/45 backdrop-blur-sm md:items-center md:p-6" role="dialog" aria-modal="true" aria-label="Your details and home layout">
      <form class="safe-bottom flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl md:rounded-[2rem]" @submit.prevent="section === 1 ? next() : submit()">
        <div class="border-b border-primary/8 px-6 pt-6 pb-4">
          <div class="flex items-center gap-3">
            <template v-for="n in [1, 2]" :key="n">
              <span class="grid size-8 place-items-center rounded-full text-sm font-black transition" :class="section >= n ? 'bg-primary text-white' : 'bg-primary-soft text-primary/50'">
                <AppIcon v-if="section > n" name="check" :size="15" /><template v-else>{{ n }}</template>
              </span>
              <span class="text-sm font-bold" :class="section >= n ? 'text-primary' : 'text-primary/40'">{{ n === 1 ? "Your details" : "Your home" }}</span>
              <span v-if="n === 1" class="h-px flex-1 bg-primary/12" />
            </template>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto px-6 py-6">
          <template v-if="section === 1">
            <h2 class="text-2xl font-black tracking-tight text-primary">Almost there</h2>
            <p class="mt-1 text-sm text-stone-500">Tell us who to send your price to.</p>
            <div class="mt-5 space-y-4">
              <label v-for="field in fields" :key="field.key" class="block">
                <span class="mb-2 block text-sm font-bold text-primary">{{ field.label }}</span>
                <input v-model="state.details[field.key]" required :type="field.type" :autocomplete="field.auto" class="min-h-12 w-full rounded-2xl border border-primary/12 bg-stone-50 px-4 text-base text-primary outline-none focus:border-primary focus:ring-3 focus:ring-primary/8" />
              </label>
            </div>
          </template>
          <template v-else>
            <h2 class="text-2xl font-black tracking-tight text-primary">Which looks like your home?</h2>
            <p class="mt-1 text-sm text-stone-500">Pick the closest match. We’ll ask a few quick questions next.</p>
            <div class="mt-5 grid grid-cols-2 gap-3">
              <button v-for="layout in layouts" :key="layout.id" type="button" class="rounded-2xl border p-2 text-left transition" :class="state.layoutId === layout.id ? 'border-primary bg-primary-soft ring-2 ring-primary' : 'border-primary/12 bg-white hover:bg-primary-soft/60'" :aria-pressed="state.layoutId === layout.id" @click="state.layoutId = layout.id; error = ''">
                <PlotDiagram :layout="layout" :included="['outside', 'front', 'back']" />
                <span class="mt-2 block px-1 text-sm font-extrabold text-primary">{{ layout.name }}</span>
                <span class="block px-1 pb-1 text-xs text-stone-500">{{ layout.description }}</span>
              </button>
            </div>
            <p v-if="error" class="mt-3 text-sm font-semibold text-red-600" role="alert">{{ error }}</p>
          </template>
        </div>

        <div class="space-y-2 border-t border-primary/8 px-6 pt-4">
          <AppButton type="submit">{{ section === 1 ? "Continue" : state.addressClass === "quote" ? "Get my quote" : "Start my plan questions" }}</AppButton>
          <button v-if="section === 2" type="button" class="min-h-11 w-full text-sm font-bold text-primary/60" @click="section = 1">Back</button>
          <router-link v-else to="/start/locate" class="flex min-h-11 items-center justify-center text-sm font-bold text-primary/60">Back to map</router-link>
        </div>
      </form>
    </div>
  </PromoShell>
</template>
