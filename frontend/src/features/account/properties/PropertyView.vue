<script setup lang="ts">
import ThumbPage from "@/components/ThumbPage.vue";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import AppCard from "@/components/AppCard.vue";
import AppIcon from "@/components/AppIcon.vue";
import { getProperty } from "@/services/mockApi";
import type { Property } from "@/types";
const route = useRoute();
const property = ref<Property>();
onMounted(async () => (property.value = await getProperty(String(route.params.id))));
</script>

<template>
  <ThumbPage v-if="property">
    <AppCard>
      <span class="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary"><AppIcon name="map" /></span>
      <p class="mt-5 text-xl font-black text-primary">{{ property.address }}</p>
    </AppCard>
    <AppCard class="mt-5">
      <p class="text-xs font-bold tracking-widest text-primary/45 uppercase">Active plan</p>
      <p class="mt-3 text-2xl font-black text-primary">{{ property.plan.name }}</p>
      <div class="mt-5 grid grid-cols-2 gap-3">
        <div class="rounded-2xl bg-primary-soft p-4"><p class="text-xs text-primary/50">Frequency</p><p class="mt-1 font-bold text-primary">{{ property.plan.frequency }}</p></div>
        <div class="rounded-2xl bg-accent-soft p-4"><p class="text-xs text-primary/50">Per visit</p><p class="mt-1 font-bold text-primary">R {{ property.plan.pricePerVisit.toFixed(2) }}</p></div>
      </div>
    </AppCard>
  </ThumbPage>
  <p v-else class="p-8 text-center text-sm text-stone-500">Property not found.</p>
</template>
