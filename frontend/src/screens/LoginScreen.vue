<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AppState, NavActions, Screen } from '../types/navigation'
const props = defineProps<{ state: AppState; actions: NavActions }>()
const phone = ref(''), otp = ref(['','','','','','']), name = ref(''), address = ref(''), quoteCode = ref('')
const showQuoteField = ref(false)
const planType = ref<'weekly' | 'project' | null>(null)
const next: Partial<Record<Screen, Screen>> = { login:'signup-otp','signup-otp':'signup-name','signup-name':'signup-address','signup-address':'signup-plan','signup-plan':'home' }
const screen = computed(() => props.state.screen)
const stepIndex = computed(() => ['signup-otp','signup-name','signup-address','signup-plan'].indexOf(screen.value))
const handleContinue = () => screen.value === 'signup-plan' ? props.actions.login() : props.actions.goTo(next[screen.value] || 'signup-otp')
const plans = [
  { id:'weekly' as const,label:'Weekly maintenance',desc:'Regular mowing, edging & paths — on a set schedule',price:'from R 250 / visit' },
  { id:'project' as const,label:'Once-off project',desc:'A single service or garden transformation',price:'Priced per job' },
]
</script>
<template>
  <div class="flex min-h-screen flex-col bg-[#F3F7F4]">
    <div class="flex flex-col items-center pb-8 pt-12"><div class="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#073B24] text-2xl text-white">🌿</div><span class="font-[Outfit] text-[1.75rem] font-extrabold tracking-[-0.02em] text-[#073B24]">evergro</span><p class="mt-1 text-sm text-gray-500">Lawn care, on your terms</p></div>
    <div class="flex-1 rounded-t-3xl bg-white px-5 pb-10 pt-8">
      <div v-if="screen !== 'login'" class="mb-6 flex gap-1.5"><div v-for="i in 4" :key="i" class="h-1 flex-1 rounded-full" :class="i - 1 <= stepIndex ? 'bg-[#073B24]' : 'bg-gray-200'"/></div>
      <template v-if="screen === 'login'"><h2 class="mb-1 font-[Outfit] text-2xl font-bold">Welcome back</h2><p class="mb-6 text-sm text-gray-500">Log in to manage your lawn visits</p><label class="mb-1.5 block text-sm font-semibold text-gray-700">Phone number or email</label><input v-model="phone" placeholder="e.g. 082 123 4567" class="w-full rounded-2xl border-2 border-gray-200 px-4 py-3.5 text-sm outline-none focus:border-[#073B24]"/><button @click="handleContinue" class="mt-4 w-full rounded-2xl bg-[#073B24] py-4 text-base font-bold text-white">Send OTP</button><button @click="actions.goTo('signup-otp')" class="mt-3 w-full rounded-2xl border-2 border-[#073B24] py-3.5 text-sm font-semibold text-[#073B24]">New here? Sign up</button></template>
      <template v-else-if="screen === 'signup-otp'"><h2 class="mb-1 font-[Outfit] text-2xl font-bold">Verify your number</h2><p class="mb-6 text-sm text-gray-500">We sent a 6-digit code to <strong>082 123 4567</strong></p><div class="mb-6 flex gap-2"><input v-for="(_,i) in otp" :key="i" v-model="otp[i]" maxlength="1" class="h-12 min-w-0 flex-1 rounded-xl border-2 text-center text-lg font-bold outline-none focus:border-[#073B24]"/></div><button @click="handleContinue" class="w-full rounded-2xl bg-[#073B24] py-4 font-bold text-white">Verify</button><button class="mt-3 w-full text-sm font-medium text-[#073B24]">Resend code</button></template>
      <template v-else-if="screen === 'signup-name'"><h2 class="mb-1 font-[Outfit] text-2xl font-bold">What's your name?</h2><p class="mb-6 text-sm text-gray-500">We'll use it to personalise your experience</p><label class="mb-1.5 block text-sm font-semibold">Full name</label><input v-model="name" placeholder="e.g. Sam Mitchell" class="w-full rounded-2xl border-2 border-gray-200 px-4 py-3.5 text-sm outline-none focus:border-[#073B24]"/><button @click="handleContinue" class="mt-6 w-full rounded-2xl bg-[#073B24] py-4 font-bold text-white">Continue</button></template>
      <template v-else-if="screen === 'signup-address'"><h2 class="mb-1 font-[Outfit] text-2xl font-bold">Your property</h2><p class="mb-5 text-sm text-gray-500">We'll use this to calculate your personalised price</p><div class="mb-3 flex h-[140px] flex-col items-center justify-center gap-2 rounded-2xl bg-[#E6F0EB] text-[#073B24]"><span class="text-3xl">⌖</span><p class="text-xs font-semibold">Tap to pin your property</p></div><label class="mb-1.5 block text-sm font-semibold">Street address</label><input v-model="address" placeholder="e.g. 12 Oak Street, Rondebosch" class="mb-3 w-full rounded-2xl border-2 border-gray-200 px-4 py-3.5 text-sm outline-none"/><button @click="showQuoteField = !showQuoteField" class="mb-3 text-sm font-medium text-[#073B24]">+ I have a quote code</button><input v-if="showQuoteField" :value="quoteCode" @input="quoteCode = ($event.target as HTMLInputElement).value.toUpperCase()" placeholder="Enter code e.g. EVG-2024" class="mb-3 w-full rounded-2xl border-2 border-[#E5D403] px-4 py-3.5 text-sm outline-none"/><button @click="handleContinue" class="w-full rounded-2xl bg-[#073B24] py-4 font-bold text-white">Continue</button></template>
      <template v-else><h2 class="mb-1 font-[Outfit] text-2xl font-bold">Choose your plan</h2><p class="mb-5 text-sm text-gray-500">You can change this at any time</p><button v-for="plan in plans" :key="plan.id" @click="planType = plan.id" class="mb-3 w-full rounded-2xl border-2 p-4 text-left" :class="planType === plan.id ? 'border-[#073B24] bg-[#E6F0EB]' : 'border-gray-200 bg-white'"><p class="text-sm font-semibold">{{ plan.label }}</p><p class="mt-0.5 text-xs text-gray-500">{{ plan.desc }}</p><p class="mt-1.5 text-xs font-bold text-[#073B24]">{{ plan.price }}</p></button><button @click="handleContinue" :disabled="!planType" class="mt-2 w-full rounded-2xl bg-[#073B24] py-4 font-bold text-white disabled:opacity-50">Get started</button></template>
    </div>
  </div>
</template>
