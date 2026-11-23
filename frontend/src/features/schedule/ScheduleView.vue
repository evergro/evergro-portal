<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import AppCard from "@/components/AppCard.vue";
import { getVisits } from "@/services/mockApi";
import type { Visit, VisitStatus } from "@/types";
import VisitCard from "./VisitCard.vue";

const mode = ref<"list" | "calendar">("list");
const visits = ref<Visit[]>([]);
const selected = ref<Visit>();
const monthDays = Array.from({ length: 30 }, (_, index) => index + 1);

onMounted(async () => {
  visits.value = await getVisits();
});

const grouped = computed(() =>
  visits.value.reduce<Record<string, Visit[]>>((groups, visit) => {
    (groups[visit.month] ||= []).push(visit);
    return groups;
  }, {}),
);

const visitForDay = (day: number) => visits.value.find((visit) => visit.month === "June 2025" && visit.day === day);
const dotClass = (status?: VisitStatus) => ({
  "bg-emerald-500": status === "Completed",
  "bg-red-500": status === "Skipped",
  "bg-accent": status === "Rescheduled",
  "bg-stone-400": status === "Upcoming",
});
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 pt-8 md:px-8 md:pt-10">
    <div class="mb-6">
      <p class="text-sm font-bold text-primary/50">Your garden, on track</p>
      <h1 class="mt-1 text-3xl font-black tracking-tight text-primary md:text-4xl">Schedule</h1>
    </div>

    <div class="mb-6 grid grid-cols-2 rounded-2xl bg-primary-soft p-1">
      <button v-for="option in ['list', 'calendar'] as const" :key="option" type="button" class="min-h-11 rounded-xl text-sm font-bold capitalize transition" :class="mode === option ? 'bg-white text-primary shadow-sm' : 'text-primary/50'" @click="mode = option">{{ option }}</button>
    </div>

    <div class="mb-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-stone-500">
      <span v-for="item in [{s:'Completed',c:'bg-emerald-500'},{s:'Upcoming',c:'bg-stone-400'},{s:'Skipped',c:'bg-red-500'},{s:'Rescheduled',c:'bg-accent'}]" :key="item.s" class="flex items-center gap-2"><i class="size-2 rounded-full" :class="item.c" />{{ item.s }}</span>
    </div>

    <div v-if="mode === 'list'" class="space-y-8">
      <section v-for="(monthVisits, month) in grouped" :key="month">
        <p class="mb-3 text-sm font-extrabold text-primary">{{ month }}</p>
        <div class="space-y-3"><VisitCard v-for="visit in monthVisits" :key="visit.id" :visit="visit" /></div>
      </section>
    </div>

    <div v-else class="space-y-4">
      <AppCard>
        <div class="mb-5 flex items-center justify-between"><p class="text-lg font-extrabold text-primary">June 2025</p><span class="text-xs font-bold text-primary/45">Today · 12</span></div>
        <div class="grid grid-cols-7 text-center text-xs font-bold text-stone-400">
          <span v-for="day in ['M','T','W','T','F','S','S']" :key="day" class="py-2">{{ day }}</span>
        </div>
        <div class="grid grid-cols-7">
          <button v-for="day in monthDays" :key="day" type="button" class="relative grid aspect-square place-items-center rounded-xl text-sm font-semibold text-stone-700 hover:bg-primary-soft" :class="{ 'bg-primary text-white hover:bg-primary': selected?.day === day }" @click="selected = visitForDay(day)">
            {{ day }}
            <i v-if="visitForDay(day)" class="absolute bottom-1.5 size-1.5 rounded-full" :class="[dotClass(visitForDay(day)?.status), selected?.day === day ? 'ring-2 ring-white' : '']" />
          </button>
        </div>
      </AppCard>
      <VisitCard v-if="selected" :key="selected.id" :visit="selected" initially-open />
      <p v-else class="py-5 text-center text-sm text-stone-500">Select a marked day to see visit details.</p>
    </div>
  </div>
</template>
