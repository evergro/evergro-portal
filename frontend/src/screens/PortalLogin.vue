<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import type { NavActions } from '../types/navigation'
const props = defineProps<{ actions: NavActions }>()
const submitting = ref(false)
let timer: number | undefined
const signIn = () => {
  if (submitting.value) return
  submitting.value = true
  timer = window.setTimeout(props.actions.login, 850)
}
onUnmounted(() => timer && window.clearTimeout(timer))
</script>
<template>
  <div class="relative flex min-h-dvh overflow-hidden bg-[#073B24]">
    <section class="relative hidden overflow-hidden bg-[#073B24] px-12 py-10 text-white transition-all duration-700 ease-[cubic-bezier(.7,0,.2,1)] lg:flex lg:flex-col" :class="submitting ? 'w-0 px-0 opacity-0' : 'w-[46%] xl:w-[43%]'">
      <div class="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/[0.035]"/>
      <button @click="actions.goTo('landing')" class="relative flex w-fit items-center gap-2.5"><span class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E5D403]">🌿</span><span class="font-[Outfit] text-[22px] font-bold tracking-[-0.04em]">evergro</span></button>
      <div class="relative my-auto max-w-md"><span class="text-xs font-semibold uppercase tracking-[0.13em] text-[#E5D403]">Your garden, organised</span><h1 class="mt-5 font-[Outfit] text-[44px] font-semibold leading-[1.05] tracking-[-0.035em]">Everything your lawn needs, all in one calm place.</h1><p class="mt-5 max-w-sm text-sm leading-6 text-white/55">Manage visits, follow your crew, view results and get help without making a phone call.</p><div class="mt-8 flex flex-wrap gap-2"><span v-for="item in ['Visit schedule','Service history','Invoices','Support']" :key="item" class="rounded-lg border border-white/15 px-3 py-2 text-xs text-white/60">{{ item }}</span></div></div>
      <p class="relative text-[11px] text-white/35">Secure Evergro Customer Portal · Gauteng, South Africa</p>
    </section>
    <section class="relative flex min-h-dvh flex-1 items-center justify-center bg-[#F8FAF9] px-6 py-12 transition-all duration-700 ease-[cubic-bezier(.7,0,.2,1)]" :class="submitting ? 'lg:w-full' : ''">
      <button @click="actions.goTo('landing')" class="absolute left-6 top-6 flex items-center gap-2 text-xs font-semibold text-[#60766D] lg:left-auto lg:right-8">‹ Back to website</button>
      <div class="w-full max-w-[390px] transition-all duration-500" :class="submitting ? 'scale-95 opacity-0' : 'opacity-100'">
        <div class="mb-10 flex items-center gap-2.5 lg:hidden"><span class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#073B24] text-white">🌿</span><span class="font-[Outfit] text-xl font-bold text-[#073B24]">evergro</span></div>
        <span class="inline-flex items-center gap-2 rounded-full bg-[#E7F0EB] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#0F5C3A]"><span class="h-1.5 w-1.5 rounded-full bg-[#16A34A]"/>Customer portal</span>
        <h2 class="mt-7 font-[Outfit] text-3xl font-bold tracking-[-0.025em] text-[#173228]">Welcome back</h2><p class="mt-2 text-sm text-[#7C8E87]">Sign in to manage your Evergro services.</p>
        <form class="mt-8" @submit.prevent="signIn"><label class="text-[11px] font-bold uppercase tracking-[0.07em] text-[#4F655C]">Email address</label><input type="email" value="sam@example.com" class="mt-2 h-12 w-full rounded-xl border border-[#C9D7D0] bg-white px-4 text-sm text-[#173228] outline-none transition focus:border-[#0F5C3A] focus:ring-3 focus:ring-[#0F5C3A]/8"/><div class="mt-5 flex items-end justify-between"><label class="text-[11px] font-bold uppercase tracking-[0.07em] text-[#4F655C]">Password</label><button type="button" class="text-xs font-semibold text-[#0F5C3A]">Forgot password?</button></div><input type="password" value="evergro2026" class="mt-2 h-12 w-full rounded-xl border border-[#C9D7D0] bg-white px-4 text-sm outline-none transition focus:border-[#0F5C3A]"/><label class="mt-4 flex items-center gap-2.5 text-xs text-[#6D8179]"><input type="checkbox" class="h-4 w-4 accent-[#073B24]"/> Keep me signed in</label><button type="submit" class="mt-7 h-12 w-full rounded-xl bg-[#073B24] text-sm font-bold text-white shadow-sm transition hover:bg-[#0F5C3A]">Sign in to portal</button></form>
        <p class="mt-7 text-center text-[11px] text-[#98A69F]">Need help? <button @click="actions.goTo('support')" class="font-semibold text-[#0F5C3A]">Contact Evergro support</button></p>
      </div>
      <div v-if="submitting" class="absolute inset-0 flex items-center justify-center"><div class="text-center"><span class="mx-auto flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-[#073B24] text-[#E5D403]">🌿</span><p class="mt-4 text-sm font-semibold text-[#173228]">Preparing your lawn dashboard…</p></div></div>
    </section>
  </div>
</template>
