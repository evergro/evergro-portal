<script setup lang="ts">
import ThumbPage from "@/components/ThumbPage.vue";
import AppCard from "@/components/AppCard.vue";
import ListRow from "@/components/ListRow.vue";
</script>

<template>
  <ThumbPage>
    <AppCard class="!py-1">
      <ListRow label="Pay Current Invoice" icon="card" to="/portal/account/payments/checkout" />
      <ListRow label="Transactions" icon="calendar" to="/portal/account/payments/transactions" />
      <ListRow label="Active Card" icon="card" to="/portal/account/payments/card" />
    </AppCard>
    <AppCard class="mt-5">
      <p class="text-sm font-bold text-primary">Payment date</p>
      <p class="mt-1 text-sm text-stone-500">Choose your next available payment date.</p>
      <input type="date" :min="new Date(Date.now() + 86400000).toISOString().slice(0, 10)" class="mt-4 min-h-12 w-full rounded-2xl border border-primary/12 bg-stone-50 px-4 text-sm text-primary outline-none focus:border-primary" />
      <p class="mt-2 text-xs text-stone-400">Today and past dates aren’t available.</p>
    </AppCard>
  </ThumbPage>
</template>
