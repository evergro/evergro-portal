<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AppState, NavActions } from '../types/navigation'
defineProps<{ state: AppState; actions: NavActions }>()
const tags = ['On time','Friendly crew','Great finish','Thorough','Professional']
const stars = ref(0), hovered = ref(0), selected = ref<string[]>([]), comment = ref(''), submitted = ref(false)
const happy = computed(() => stars.value >= 4)
const toggleTag = (tag: string) => selected.value = selected.value.includes(tag) ? selected.value.filter(item => item !== tag) : [...selected.value, tag]
</script>
<template>
  <div v-if="submitted" class="flex flex-col items-center px-6 pb-8 pt-12 text-center">
    <div class="mb-4 flex h-20 w-20 items-center justify-center rounded-full text-4xl" :class="happy ? 'bg-[#E8F5E9]' : 'bg-[#FEF2F2]'">{{ happy ? '★' : '!' }}</div>
    <h2 class="font-[Outfit] text-[1.375rem] font-bold text-[#111827]">{{ happy ? 'Thank you, Sam!' : "We're sorry to hear that" }}</h2>
    <p class="mt-2 text-sm leading-relaxed text-gray-500">{{ happy ? "We're glad Jake & Team did a great job. See you next week!" : "We've opened a support ticket and our team will be in touch shortly." }}</p>
    <div v-if="happy" class="mt-6 w-full rounded-2xl bg-[#E6F0EB] p-4"><p class="mb-3 text-sm font-semibold text-[#073B24]">Would you share this on Google?</p><button class="w-full rounded-xl bg-[#073B24] py-3 text-sm font-bold text-white">Share on Google</button></div>
    <button @click="actions.setTab('home')" class="mt-5 text-sm font-medium text-[#073B24]">Back to Home</button>
  </div>
  <div v-else class="pb-8">
    <div class="flex flex-col items-center px-4 pt-4"><p class="mb-6 text-center text-sm text-gray-500">Jake & Team · Tue 17 Sep · Lawn Mowing</p>
      <div class="mb-5 flex gap-3"><button v-for="s in 5" :key="s" @mouseenter="hovered=s" @mouseleave="hovered=0" @click="stars=s" class="text-[42px] leading-none transition-transform active:scale-95" :class="(hovered || stars) >= s ? 'text-[#E5D403]' : 'text-gray-300'">★</button></div>
      <p v-if="stars" class="mb-5 text-sm font-semibold text-[#073B24]">{{ ['','Not great','Could be better','It was okay','Really good!','Outstanding!'][stars] }}</p>
      <div class="mb-4 w-full"><p class="mb-2.5 text-sm font-bold text-gray-700">Quick tags</p><div class="flex flex-wrap gap-2"><button v-for="tag in tags" :key="tag" @click="toggleTag(tag)" class="rounded-full border-2 px-3.5 py-2 text-sm font-semibold" :class="selected.includes(tag) ? 'border-[#073B24] bg-[#073B24] text-white' : 'border-gray-200 bg-white text-gray-700'">{{ tag }}</button></div></div>
      <div class="mb-4 w-full"><p class="mb-2 text-sm font-bold text-gray-700">Add a comment (optional)</p><textarea v-model="comment" rows="3" placeholder="Tell us anything else…" class="w-full resize-none rounded-2xl border-2 border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#073B24]"/></div>
      <button class="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-400">Add a photo</button>
      <button @click="stars && (submitted=true)" :disabled="!stars" class="w-full rounded-2xl bg-[#073B24] py-4 text-base font-bold text-white disabled:opacity-40">Submit review</button>
    </div>
  </div>
</template>
