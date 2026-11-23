<script setup lang="ts">
import { onMounted, ref } from "vue";
import AppIcon from "@/components/AppIcon.vue";
import { getSupport } from "@/services/mockApi";
import PromoShell from "./components/PromoShell.vue";
import { usePromoFlow } from "./usePromoFlow";

const { state } = usePromoFlow();
const support = ref({ phone: "", whatsapp: "" });
onMounted(async () => (support.value = await getSupport()));
</script>

<template>
  <PromoShell>
    <div class="mx-auto flex min-h-[calc(100dvh-6rem)] max-w-lg flex-col px-4 pt-8 pb-4 md:min-h-0 md:pt-16">
      <div class="my-auto text-center">
        <span class="mx-auto grid size-16 place-items-center rounded-full bg-accent text-primary"><AppIcon name="clock" :size="30" /></span>
        <h1 class="mt-6 text-3xl font-black tracking-tight text-primary">We’ll send your quote soon.</h1>
        <p class="mx-auto mt-3 max-w-sm text-sm leading-6 text-stone-600">We couldn’t price your yard automatically, so a team member will measure it by hand. Your details are saved and your quote will arrive in under an hour during business hours.</p>
        <div class="card-shadow mx-auto mt-6 max-w-sm rounded-3xl bg-white p-5 text-left text-sm">
          <p class="font-bold text-primary">{{ state.details.name }}</p>
          <p class="mt-1 text-stone-500">{{ state.address }}</p>
          <p class="mt-1 text-stone-500">{{ state.details.phone }} · {{ state.details.email }}</p>
        </div>
      </div>
      <div class="mt-8 space-y-3">
        <a :href="`https://wa.me/${support.whatsapp}`" target="_blank" class="flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-primary px-5 font-bold text-white"><AppIcon name="message" />Message us on WhatsApp</a>
        <a :href="`tel:${support.phone.replace(/ /g, '')}`" class="flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-primary/15 bg-white px-5 font-bold text-primary"><AppIcon name="phone" />Call {{ support.phone }}</a>
      </div>
    </div>
  </PromoShell>
</template>
