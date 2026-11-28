<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import AppCard from "@/components/AppCard.vue";
import AppIcon from "@/components/AppIcon.vue";
import BeforeAfter from "@/components/BeforeAfter.vue";
import { getVisit } from "@/services/api";
import type { Visit } from "@/types";

const route = useRoute();
const visit = ref<Visit>();
const loading = ref(true);

onMounted(async () => {
  visit.value = await getVisit(String(route.params.id));
  loading.value = false;
});

const minutes = (time?: string) => {
  const [h, m] = (time ?? "").split(":").map(Number);
  return h * 60 + m;
};
const onSite = computed(() => {
  if (!visit.value?.arrival || !visit.value.finish) return "";
  const total = minutes(visit.value.finish) - minutes(visit.value.arrival);
  return total >= 60 ? `${Math.floor(total / 60)}h ${total % 60}m` : `${total} min`;
});
const tone = computed(() => {
  switch (visit.value?.status) {
    case "Completed": return "bg-emerald-50 text-emerald-800";
    case "Skipped": return "bg-red-50 text-red-700";
    case "Rescheduled": return "bg-accent-soft text-primary";
    default: return "bg-stone-100 text-stone-700";
  }
});
</script>

<template>
  <div v-if="visit" class="mx-auto w-full max-w-2xl space-y-4 px-4 pt-6 md:px-8 md:pt-10">
    <div class="rounded-3xl p-5" :class="tone">
      <p class="flex items-center gap-2 text-sm font-extrabold">
        <span class="grid size-6 place-items-center rounded-full bg-current/15"><AppIcon :name="visit.status === 'Completed' ? 'check' : 'clock'" :size="14" /></span>{{ visit.status }}
      </p>
      <p class="mt-3 text-2xl font-black tracking-tight">{{ visit.date }}</p>
      <p class="mt-1 text-sm opacity-75">{{ visit.service }} · {{ visit.property }}</p>
    </div>

    <AppCard v-if="visit.arrival">
      <div class="grid grid-cols-3 divide-x divide-primary/8 text-center">
        <div><p class="text-xs text-primary/45">Arrived</p><p class="mt-1 font-black text-primary">{{ visit.arrival }}</p></div>
        <div><p class="text-xs text-primary/45">Finished</p><p class="mt-1 font-black text-primary">{{ visit.finish }}</p></div>
        <div><p class="text-xs text-primary/45">On site</p><p class="mt-1 font-black text-primary">{{ onSite }}</p></div>
      </div>
    </AppCard>
    <AppCard v-else>
      <p class="text-xs text-primary/45">Time window</p>
      <p class="mt-1 font-black text-primary">{{ visit.timeWindow }}</p>
    </AppCard>

    <AppCard v-if="visit.reason">
      <p class="text-xs font-bold tracking-widest text-primary/45 uppercase">{{ visit.status === "Skipped" ? "Why we skipped" : "Why it moved" }}</p>
      <p class="mt-2 text-sm leading-6 text-stone-700">{{ visit.reason }}</p>
      <p v-if="visit.newDate" class="mt-4 rounded-2xl bg-accent-soft px-4 py-3 text-sm font-bold text-primary">New date: {{ visit.newDate }}</p>
    </AppCard>

    <div v-if="visit.beforePhoto && visit.afterPhoto">
      <p class="mb-2 px-1 text-sm font-extrabold text-primary">Before and after</p>
      <BeforeAfter :before="visit.beforePhoto" :after="visit.afterPhoto" />
    </div>

    <AppCard v-if="visit.tasks?.length">
      <p class="text-sm font-extrabold text-primary">What we did</p>
      <ul class="mt-3 space-y-3">
        <li v-for="task in visit.tasks" :key="task" class="flex items-center gap-3 text-sm text-stone-700">
          <span class="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700"><AppIcon name="check" :size="13" /></span>{{ task }}
        </li>
      </ul>
      <p v-if="visit.notes" class="mt-4 border-t border-primary/8 pt-4 text-sm leading-6 text-stone-500"><strong>Team note:</strong> {{ visit.notes }}</p>
    </AppCard>

    <AppCard v-if="visit.team" class="flex items-center gap-4">
      <span class="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-sm font-black text-white">{{ visit.team[0] }}</span>
      <div><p class="font-extrabold text-primary">{{ visit.team }}</p><p v-if="visit.teamNote" class="text-sm text-stone-500">{{ visit.teamNote }}</p></div>
    </AppCard>
  </div>
  <p v-else-if="!loading" class="p-10 text-center text-sm text-stone-500">We couldn’t find that visit.</p>
</template>
