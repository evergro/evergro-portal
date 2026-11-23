<script setup lang="ts">
import type { PaymentCard } from "@/types";
defineProps<{ card: PaymentCard }>();
</script>

<template>
  <div class="relative aspect-[1.58/1] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-emerald-900 to-primary p-6 text-white shadow-2xl shadow-primary/20">
    <div class="absolute -top-16 -right-12 size-48 rounded-full border border-white/10" />
    <div class="absolute -right-5 -bottom-24 size-56 rounded-full bg-accent/10" />
    <div class="relative flex h-full flex-col">
      <div class="flex items-start justify-between">
        <span class="h-9 w-12 rounded-lg bg-gradient-to-br from-accent to-amber-200 shadow-inner" />
        <svg v-if="card.type === 'Visa'" viewBox="0 0 80 28" class="w-16 fill-white" aria-label="Visa"><text x="2" y="22" font-size="25" font-weight="900" font-style="italic">VISA</text></svg>
        <svg v-else viewBox="0 0 70 42" class="w-14" aria-label="Mastercard"><circle cx="27" cy="21" r="18" fill="#fff" opacity=".85"/><circle cx="43" cy="21" r="18" fill="#e5d403" opacity=".85"/></svg>
      </div>
      <p class="mt-auto text-xl font-semibold tracking-[0.18em] md:text-2xl">•••• •••• •••• {{ card.last4 }}</p>
      <div class="mt-5 flex justify-between text-xs">
        <div><p class="text-white/45">CARDHOLDER</p><p class="mt-1 font-bold tracking-wider">{{ card.cardholder }}</p></div>
        <div><p class="text-white/45">EXPIRES</p><p class="mt-1 font-bold">{{ card.expiry }}</p></div>
      </div>
    </div>
  </div>
</template>
