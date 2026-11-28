<script setup lang="ts">
import { onMounted, ref } from "vue";
import AppIcon from "@/components/AppIcon.vue";
import { getActivePromo } from "@/services/api";
import type { Campaign } from "@/types";

const promo = ref<Campaign>();
onMounted(async () => (promo.value = await getActivePromo()));
</script>

<template>
  <router-link v-if="promo" :to="`/promo/${promo.slug}`" class="group relative mb-5 flex items-center gap-4 overflow-hidden rounded-3xl bg-primary p-4 text-white shadow-lg shadow-primary/15 md:p-5">
    <svg class="pointer-events-none absolute -right-6 -bottom-6 w-48 opacity-70" viewBox="0 0 200 100" fill="none" aria-hidden="true"><path d="M0 70C50 20 100 90 200 30" stroke="#E5D403" stroke-width="6" stroke-linecap="round" /></svg>
    <span class="relative grid size-12 shrink-0 place-items-center rounded-2xl bg-accent text-primary"><AppIcon name="spark" :size="22" /></span>
    <span class="relative min-w-0 flex-1">
      <span class="block text-[0.65rem] font-extrabold tracking-[0.16em] text-accent uppercase">{{ promo.name }}</span>
      <span class="block font-extrabold">{{ promo.bannerTitle }}</span>
      <span class="block text-sm text-white/65">{{ promo.bannerText }}</span>
    </span>
    <AppIcon name="arrow" :size="20" class="relative shrink-0 transition group-hover:translate-x-1" />
  </router-link>
</template>
