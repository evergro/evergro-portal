<script setup lang="ts">
import { onMounted, ref } from "vue";
import AppIcon from "@/components/AppIcon.vue";
import { getSupport } from "@/services/mockApi";
import EvergroLogo from "./EvergroLogo.vue";

defineProps<{ dark?: boolean; step?: number; steps?: number; appOnMobile?: boolean }>();
const support = ref({ phone: "", whatsapp: "" });
onMounted(async () => (support.value = await getSupport()));
</script>

<template>
  <div class="min-h-dvh" :class="dark ? 'bg-primary' : ''">
    <header class="safe-top relative z-20" :class="[dark ? '' : 'border-b border-primary/8 bg-white/85 backdrop-blur-xl', appOnMobile ? 'max-md:hidden' : '']">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:h-20 md:px-8">
        <router-link to="/promo" aria-label="Evergro home"><EvergroLogo :light="dark" /></router-link>
        <a
          :href="`tel:${support.phone.replace(/ /g, '')}`"
          class="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold"
          :class="dark ? 'text-white hover:bg-white/10' : 'text-primary hover:bg-primary-soft'"
        >
          <AppIcon name="phone" :size="18" />
          <span class="hidden sm:inline">{{ support.phone }}</span>
          <span class="sm:hidden">Call</span>
        </a>
      </div>
      <div v-if="step && steps" class="mx-auto flex max-w-6xl gap-1.5 px-4 pb-3 md:px-8">
        <span v-for="n in steps" :key="n" class="h-1 flex-1 rounded-full transition-colors" :class="n <= step ? 'bg-primary' : 'bg-primary/12'" />
      </div>
    </header>
    <slot />
  </div>
</template>
