<script setup lang="ts">
import { onMounted, ref } from "vue";
import AppIcon from "@/components/AppIcon.vue";
import { getSupport } from "@/services/api";

const support = ref({ phone: "", whatsapp: "" });
onMounted(async () => (support.value = await getSupport()));
</script>

<template>
  <div class="mx-auto flex min-h-[calc(100vh-6rem)] max-w-xl flex-col px-4 pt-8 md:min-h-0 md:px-8 md:pt-16">
    <div>
      <p class="text-sm font-bold text-primary/50">We’re here to help</p>
      <h1 class="mt-1 text-3xl font-black tracking-tight text-primary md:text-4xl">Support</h1>
    </div>
    <div class="mt-auto pb-4 md:mt-12 md:rounded-3xl md:border md:border-primary/7 md:bg-white md:p-8 md:card-shadow">
      <p class="mb-5 text-center text-sm leading-6 text-stone-600">Need a hand? Our friendly team is only a tap away.</p>
      <div class="space-y-3">
        <a :href="`tel:${support.phone.replace(/ /g, '')}`" class="flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-primary px-5 font-bold text-white shadow-lg shadow-primary/15"><AppIcon name="phone" />Call us</a>
        <a :href="`https://wa.me/${support.whatsapp}`" target="_blank" class="flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-primary/15 bg-white px-5 font-bold text-primary"><AppIcon name="message" />Send us a message</a>
      </div>
      <p class="mt-4 text-center text-xs font-semibold text-primary/45">{{ support.phone }}</p>
    </div>
  </div>
</template>
