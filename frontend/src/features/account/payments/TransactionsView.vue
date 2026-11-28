<script setup lang="ts">
import { onMounted, ref } from "vue";
import AppCard from "@/components/AppCard.vue";
import AppIcon from "@/components/AppIcon.vue";
import StatusBadge from "@/components/StatusBadge.vue";
import { getTransactions } from "@/services/api";
import type { Transaction } from "@/types";
const transactions = ref<Transaction[]>([]);
onMounted(async () => (transactions.value = await getTransactions()));

const canPay = (transaction: Transaction) =>
  transaction.type === "Invoice" && transaction.status === "Due";
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 pt-6 md:px-8 md:pt-10">
    <AppCard class="!py-1">
      <component
        :is="canPay(transaction) ? 'router-link' : 'div'"
        v-for="transaction in transactions"
        :key="transaction.id"
        :to="canPay(transaction) ? '/portal/account/payments/checkout' : undefined"
        class="flex min-h-20 items-center gap-4 border-b border-stone-100 py-4 last:border-0"
        :class="
          canPay(transaction)
            ? 'group -mx-2 rounded-2xl px-2 transition hover:bg-primary-soft'
            : ''
        "
      >
        <span class="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-xs font-black text-primary">{{ transaction.type === "Invoice" ? "INV" : "PAY" }}</span>
        <div class="min-w-0 flex-1"><p class="font-bold text-primary">{{ transaction.id }}</p><p class="mt-1 text-xs text-stone-500">{{ transaction.type }} · {{ transaction.date }}</p></div>
        <div class="text-right"><p class="font-extrabold text-primary">R {{ transaction.amount.toFixed(2) }}</p><StatusBadge class="mt-1" :status="transaction.status" /></div>
        <AppIcon
          v-if="canPay(transaction)"
          name="chevron"
          :size="18"
          class="shrink-0 text-primary/35 transition group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </component>
    </AppCard>
  </div>
</template>
