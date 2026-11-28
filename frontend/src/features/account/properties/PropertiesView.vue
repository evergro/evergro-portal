<script setup lang="ts">
import { onMounted, ref } from "vue";
import AppIcon from "@/components/AppIcon.vue";
import { getProperties } from "@/services/api";
import type { Property } from "@/types";
const properties = ref<Property[]>([]);
onMounted(async () => (properties.value = await getProperties()));
</script>

<template>
  <div class="mx-auto grid w-full max-w-4xl gap-4 px-4 pt-6 md:grid-cols-2 md:px-8 md:pt-10">
    <router-link v-for="property in properties" :key="property.id" :to="`/portal/account/properties/${property.id}`" class="card-shadow group overflow-hidden rounded-3xl border border-primary/6 bg-white">
      <div class="relative">
        <img :src="property.photo" :alt="`Garden at ${property.address}`" class="h-40 w-full object-cover transition duration-500 group-hover:scale-105" />
        <span class="absolute bottom-3 left-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">{{ property.plan.name }}</span>
      </div>
      <div class="p-5">
        <p class="font-extrabold text-primary">{{ property.address }}</p>
        <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div class="rounded-2xl bg-primary-soft p-3"><p class="text-xs text-primary/50">Plan</p><p class="mt-1 font-bold text-primary">{{ property.plan.frequency }}</p></div>
          <div class="rounded-2xl bg-accent-soft p-3"><p class="text-xs text-primary/50">Last visit</p><p class="mt-1 font-bold text-primary">{{ property.lastVisit }}</p></div>
        </div>
        <p class="mt-4 flex items-center justify-end gap-1 text-sm font-bold text-primary">View property<AppIcon name="chevron" :size="16" /></p>
      </div>
    </router-link>
  </div>
</template>
