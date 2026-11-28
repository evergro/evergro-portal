<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import AppIcon from "@/components/AppIcon.vue";
import { getMemberPromos } from "@/services/api";
import type { MemberPromo } from "@/types";

const emit = defineEmits<{ claimed: [message: string] }>();
const KEY = "evergro-dismissed-promos";
const promo = ref<MemberPromo>();
let timer = 0;

const dismissed = (): string[] => {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
};

onMounted(() => {
  // Not forced: appears shortly after the page loads and is easy to close.
  timer = window.setTimeout(async () => {
    const all = await getMemberPromos();
    promo.value = all.find((item) => !dismissed().includes(item.id));
  }, 1400);
});
onBeforeUnmount(() => window.clearTimeout(timer));

function close() {
  if (promo.value) sessionStorage.setItem(KEY, JSON.stringify([...dismissed(), promo.value.id]));
  promo.value = undefined;
}
function claim() {
  if (!promo.value) return;
  emit("claimed", promo.value.confirmation);
  close();
}
</script>

<template>
  <Transition name="promo">
    <div v-if="promo" class="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm md:items-center" @click.self="close">
      <section class="relative w-full max-w-sm overflow-hidden rounded-[2rem] bg-primary p-6 text-white shadow-2xl" role="dialog" aria-modal="true" :aria-label="promo.title">
        <svg class="pointer-events-none absolute -right-10 -bottom-6 w-64 opacity-60" viewBox="0 0 200 100" fill="none" aria-hidden="true"><path d="M0 70C50 20 100 90 200 30" stroke="#E5D403" stroke-width="6" stroke-linecap="round" /></svg>
        <button type="button" class="absolute top-3 right-3 grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Close offer" @click="close"><AppIcon name="close" :size="20" /></button>
        <div class="relative">
          <span class="grid size-14 place-items-center rounded-2xl bg-accent text-primary"><AppIcon name="gift" :size="26" /></span>
          <p class="mt-5 text-xs font-extrabold tracking-[0.16em] text-accent uppercase">{{ promo.badge }}</p>
          <h2 class="mt-1 text-4xl leading-[0.95] font-black tracking-tight uppercase">{{ promo.title }}</h2>
          <p class="mt-3 text-sm leading-6 text-white/75">{{ promo.text }}</p>
          <button type="button" class="mt-6 flex min-h-14 w-full items-center justify-center rounded-2xl bg-accent font-extrabold text-primary active:scale-[0.98]" @click="claim">{{ promo.cta }}</button>
          <button type="button" class="mt-1 min-h-11 w-full text-sm font-bold text-white/60" @click="close">Maybe later</button>
        </div>
      </section>
    </div>
  </Transition>
</template>

<style scoped>
.promo-enter-active, .promo-leave-active { transition: opacity 0.25s ease; }
.promo-enter-active section, .promo-leave-active section { transition: transform 0.3s ease; }
.promo-enter-from, .promo-leave-to { opacity: 0; }
.promo-enter-from section, .promo-leave-to section { transform: translateY(24px) scale(0.97); }
@media (prefers-reduced-motion: reduce) { .promo-enter-active, .promo-leave-active, .promo-enter-active section, .promo-leave-active section { transition: none; } }
</style>
