<script setup lang="ts">
import { onMounted, ref } from "vue";
import AppIcon from "@/components/AppIcon.vue";
import { joinWaitlist } from "@/services/promoApi";
import PromoShell from "./components/PromoShell.vue";
import { usePromoFlow } from "./usePromoFlow";

const { state } = usePromoFlow();
const saved = ref(false);
onMounted(async () => {
  await joinWaitlist({ address: state.address });
  saved.value = true;
});
</script>

<template>
  <PromoShell>
    <div class="mx-auto flex min-h-[calc(100dvh-6rem)] max-w-lg flex-col px-4 pt-8 pb-4 md:min-h-0 md:pt-16">
      <div class="my-auto text-center">
        <span class="mx-auto grid size-16 place-items-center rounded-full bg-primary text-accent"><AppIcon name="pin" :size="30" /></span>
        <h1 class="mt-6 text-3xl font-black tracking-tight text-primary">You’re on the waitlist.</h1>
        <p class="mx-auto mt-3 max-w-sm text-sm leading-6 text-stone-600">We don’t service <strong class="text-primary">{{ state.address }}</strong> just yet, but we’ve added you to our waitlist and will let you know as soon as we reach your area.</p>
      </div>
      <router-link to="/promo" class="mt-8 flex min-h-14 items-center justify-center rounded-2xl border border-primary/15 bg-white px-5 font-bold text-primary">Try a different address</router-link>
    </div>
  </PromoShell>
</template>
