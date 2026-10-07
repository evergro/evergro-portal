<script setup lang="ts">
import type { AppState, NavActions } from '../types/navigation'
defineProps<{ state: AppState; actions: NavActions }>()
const img = (id: string, w = 400, h = 300) => `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format`
const reviews = [
  { name: 'Priya N.', stars: 5, text: 'My lawn has never looked better. The crew is always on time and so thorough.' },
  { name: 'Mark T.', stars: 5, text: "Signed up for weekly mowing and couldn't be happier. Worth every rand." },
  { name: 'Lerato M.', stars: 5, text: "They did a full garden clean-up before my daughter's wedding. Absolutely stunning." },
]
const services = [
  { name: 'Lawn Mowing', icon: '🌿', from: 'R 250' }, { name: 'Fertilising', icon: '🌱', from: 'R 180' },
  { name: 'Weed Control', icon: '🍃', from: 'R 150' }, { name: 'Hedge Trimming', icon: '✂️', from: 'R 200' },
  { name: 'Garden Clean-up', icon: '🧹', from: 'R 350' }, { name: 'Irrigation', icon: '💧', from: 'R 600' },
]
</script>
<template>
  <div class="pb-6">
    <div class="relative mx-4 mt-3 h-[220px] overflow-hidden rounded-3xl"><img :src="img('1458245201577-fc8a130b8829',800,440)" alt="Professional lawn mowing" class="h-full w-full object-cover"/><div class="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(7,59,36,0.3),rgba(7,59,36,0.85))]"/><div class="absolute inset-x-0 bottom-0 p-5"><span class="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#E5D403] px-3 py-1 text-xs font-bold text-[#073B24]">Limited offer</span><h2 class="font-[Outfit] text-[1.375rem] font-bold leading-tight text-white">First cut free for new customers</h2><p class="mt-1 text-sm text-white/80">Professional lawn care, on your schedule.</p></div></div>
    <div class="mx-4 mt-4 flex gap-3"><button @click="actions.goTo('login')" class="flex-1 rounded-2xl bg-[#073B24] py-3.5 text-sm font-semibold text-white active:opacity-80">Log in</button><button @click="actions.goTo('signup-otp')" class="flex-1 rounded-2xl border-2 border-[#073B24] py-3.5 text-sm font-semibold text-[#073B24] active:opacity-80">Sign up free</button></div>
    <div class="mx-4 mt-3"><button @click="actions.goTo('signup-otp')" class="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E5D403] py-3.5 text-sm font-semibold text-[#073B24] active:opacity-80">⌕ Get an instant quote</button></div>
    <div class="mx-4 mt-6"><h3 class="mb-3 font-[Outfit] text-[1.0625rem] font-bold text-[#111827]">Our services</h3><div class="grid grid-cols-3 gap-2.5"><button v-for="service in services" :key="service.name" @click="actions.goTo('signup-otp')" class="rounded-2xl bg-white p-3 text-center shadow-[0_1px_8px_rgba(7,59,36,0.07)] transition-transform active:scale-95"><div class="mb-1 text-2xl">{{ service.icon }}</div><div class="text-xs font-semibold leading-tight text-gray-800">{{ service.name }}</div><div class="mt-0.5 text-xs text-gray-500">from {{ service.from }}</div></button></div></div>
    <div class="mx-4 mt-6"><h3 class="mb-3 font-[Outfit] text-[1.0625rem] font-bold text-[#111827]">Real results</h3><div class="flex gap-3"><div class="relative h-[120px] flex-1 overflow-hidden rounded-2xl"><img :src="img('1526392587392-d1627b6c134a',300,240)" alt="Before" class="h-full w-full object-cover grayscale opacity-70"/><span class="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">Before</span></div><div class="relative h-[120px] flex-1 overflow-hidden rounded-2xl"><img :src="img('1690068023694-053da714f95f',300,240)" alt="After" class="h-full w-full object-cover"/><span class="absolute bottom-2 left-2 rounded-full bg-[#073B24]/90 px-2 py-0.5 text-xs text-white">After</span></div></div></div>
    <div class="mt-6"><h3 class="mx-4 mb-3 font-[Outfit] text-[1.0625rem] font-bold text-[#111827]">What our customers say</h3><div class="scrollbar-hide flex gap-3 overflow-x-auto px-4"><div v-for="review in reviews" :key="review.name" class="w-[220px] shrink-0 rounded-2xl bg-white p-4 shadow-[0_1px_8px_rgba(7,59,36,0.07)]"><div class="mb-2 text-[#E5D403]">★★★★★</div><p class="text-sm leading-relaxed text-gray-600">"{{ review.text }}"</p><p class="mt-2 text-xs font-semibold text-[#073B24]">— {{ review.name }}</p></div></div></div>
    <div class="mx-4 mt-6 flex gap-3"><button class="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[#073B24] py-3 text-sm font-semibold text-[#073B24]">Call us</button><button class="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3 text-sm font-semibold text-white">WhatsApp</button></div>
    <div class="mx-4 mt-8 flex flex-col items-center gap-3 border-t border-gray-200 pt-6"><button @click="actions.goTo('support')" class="rounded-2xl bg-[#073B24] px-6 py-3 text-sm font-semibold text-white">Chat with an expert</button><p class="mt-4 text-xs text-gray-400">Thank you for choosing Evergro Landscapers</p></div>
  </div>
</template>
