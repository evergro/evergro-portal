<script setup lang="ts">
import { ref } from "vue";
import AppIcon from "@/components/AppIcon.vue";
import BeforeAfter from "@/components/BeforeAfter.vue";
import StatusBadge from "@/components/StatusBadge.vue";
import type { Visit } from "@/types";

const props = defineProps<{ visit: Visit; initiallyOpen?: boolean }>();
const open = ref(props.initiallyOpen || false);
</script>

<template>
  <article class="overflow-hidden rounded-3xl border border-primary/7 bg-white card-shadow">
    <button type="button" class="flex min-h-20 w-full items-center gap-4 p-4 text-left md:p-5" @click="open = !open">
      <span class="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-center text-primary">
        <span class="text-lg font-black leading-none">{{ visit.day }}</span>
      </span>
      <span class="min-w-0 flex-1">
        <span class="block truncate font-extrabold text-primary">{{ visit.service }}</span>
        <span class="mt-1 block text-xs text-stone-500">{{ visit.date }} · {{ visit.timeWindow }}</span>
      </span>
      <StatusBadge :status="visit.status" />
      <AppIcon name="chevron" :size="17" class="shrink-0 text-stone-400 transition" :class="{ 'rotate-90': open }" />
    </button>
    <div v-if="open" class="border-t border-stone-100 p-4 md:p-5">
      <p v-if="visit.reason" class="rounded-2xl bg-stone-50 p-4 text-sm leading-6 text-stone-700"><strong>Reason:</strong> {{ visit.reason }}</p>
      <p v-if="visit.newDate" class="mt-3 text-sm font-bold text-primary">New date: <u>{{ visit.newDate }}</u></p>
      <div v-if="visit.arrival" class="mb-4 grid grid-cols-2 gap-3">
        <div class="rounded-2xl bg-primary-soft p-3"><p class="text-xs text-primary/50">Arrived</p><p class="mt-1 font-bold text-primary">{{ visit.arrival }}</p></div>
        <div class="rounded-2xl bg-primary-soft p-3"><p class="text-xs text-primary/50">Finished</p><p class="mt-1 font-bold text-primary">{{ visit.finish }}</p></div>
      </div>
      <BeforeAfter v-if="visit.beforePhoto && visit.afterPhoto" :before="visit.beforePhoto" :after="visit.afterPhoto" />
      <p v-if="visit.summary" class="mt-4 text-sm leading-6 text-stone-600">{{ visit.summary }}</p>
      <p v-if="visit.notes" class="mt-3 text-sm leading-6 text-stone-500"><strong>Team note:</strong> {{ visit.notes }}</p>
      <router-link :to="`/portal/schedule/${visit.id}`" class="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary-soft text-sm font-bold text-primary hover:bg-primary-soft/70">View more<AppIcon name="chevron" :size="16" /></router-link>
    </div>
  </article>
</template>
