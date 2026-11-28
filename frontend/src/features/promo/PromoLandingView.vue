<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppIcon from "@/components/AppIcon.vue";
import { getSupport } from "@/services/api";
import { classifyAddress, getCampaign, getFaqs, getHowItWorks, getIntroSlides, getPricing } from "@/services/api";
import type { Campaign, FaqItem, IntroSlide, PricingBundle, PromoStep } from "@/types";
import PromoShell from "./components/PromoShell.vue";
import { usePromoFlow } from "./usePromoFlow";

const route = useRoute();
const router = useRouter();
const { state, reset } = usePromoFlow();

const campaign = ref<Campaign>();
const bundles = ref<PricingBundle[]>([]);
const faqs = ref<FaqItem[]>([]);
const steps = ref<PromoStep[]>([]);
const support = ref({ phone: "", whatsapp: "" });
const address = ref(state.address);
const error = ref("");
const busy = ref(false);
const openFaq = ref(0);
const slides = ref<IntroSlide[]>([]);
const slide = ref(0);

onMounted(async () => {
  const [c, pricing, f, h, s, sl] = await Promise.all([
    getCampaign(route.params.campaign as string | undefined),
    getPricing(),
    getFaqs(),
    getHowItWorks(),
    getSupport(),
    getIntroSlides(),
  ]);
  slides.value = sl;
  campaign.value = c;
  bundles.value = pricing.bundles;
  faqs.value = f;
  steps.value = h;
  support.value = s;
});

async function seePrice() {
  if (!address.value.trim()) {
    error.value = "Add your address so we can find your lawn.";
    return;
  }
  error.value = "";
  busy.value = true;
  reset();
  state.campaign = campaign.value?.slug ?? "spring-special";
  state.address = address.value.trim();
  state.addressClass = await classifyAddress(state.address);
  busy.value = false;
  router.push(state.addressClass === "waitlist" ? "/start/waitlist" : "/start/locate");
}

const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
const from = (bundle: PricingBundle) => Math.min(...Object.values(bundle.prices));
</script>

<template>
  <PromoShell dark app-on-mobile>
    <template v-if="campaign">
      <!-- Mobile: app-style intro -->
      <section class="relative flex min-h-dvh flex-col overflow-hidden bg-primary text-white md:hidden">
        <img v-if="slides[slide]?.image" :src="slides[slide].image" alt="" class="absolute inset-0 size-full object-cover opacity-70" />
        <div class="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-primary/10" />
        <div class="safe-top relative z-10 flex items-center gap-1.5 px-4 pt-3" role="progressbar" :aria-valuenow="slide + 1" :aria-valuemax="slides.length">
          <span v-for="(item, n) in slides" :key="item.id" class="h-1 flex-1 rounded-full transition-colors duration-500" :class="n <= slide ? 'bg-accent' : 'bg-white/25'" />
        </div>
        <div class="relative z-10 flex items-center justify-between px-4 pt-3">
          <EvergroLogo light />
          <button v-if="slide < slides.length - 1" type="button" class="min-h-11 rounded-full bg-white/12 px-4 text-sm font-bold" @click="slide = slides.length - 1">Skip</button>
        </div>
        <div v-if="slides[slide]" :key="slide" class="intro-in relative z-10 mt-auto px-5 pb-4">
          <span v-if="slide === 0" class="mb-4 inline-flex items-center gap-2 rounded-full bg-accent px-3.5 py-1.5 text-xs font-extrabold tracking-[0.14em] text-primary uppercase"><AppIcon name="gift" :size="14" />{{ campaign.name }}</span>
          <h1 class="text-5xl leading-[0.95] font-black tracking-tight uppercase">{{ slides[slide].title }}</h1>
          <p class="mt-3 text-base leading-6 text-white/75">{{ slides[slide].text }}</p>

          <form v-if="slide === slides.length - 1" class="mt-5" @submit.prevent="seePrice">
            <label class="flex min-h-14 items-center gap-3 rounded-2xl bg-white px-4 text-primary">
              <AppIcon name="pin" :size="20" class="shrink-0" />
              <span class="sr-only">Your address</span>
              <input v-model="address" type="text" autocomplete="street-address" placeholder="Your address, e.g. Sky City" class="w-full bg-transparent text-base outline-none placeholder:text-stone-400" />
            </label>
            <p v-if="error" class="mt-2 text-sm font-semibold text-red-300" role="alert">{{ error }}</p>
            <button type="submit" :disabled="busy" class="safe-bottom-btn mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent font-extrabold text-primary shadow-lg shadow-black/25 active:scale-[0.98] disabled:opacity-60">{{ busy ? "Checking…" : "Find my plan" }}<AppIcon name="arrow" :size="18" /></button>
          </form>
          <button v-else type="button" class="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent font-extrabold text-primary shadow-lg shadow-black/25 active:scale-[0.98]" @click="slide++">Next<AppIcon name="arrow" :size="18" /></button>
          <p class="safe-bottom mt-3 text-center text-xs font-bold text-accent">Free cut · No contract · Cancel any time</p>
        </div>
      </section>

      <div class="max-md:hidden">
      <!-- Hero -->
      <section class="relative overflow-hidden bg-primary text-white">
        <svg class="pointer-events-none absolute -right-24 -bottom-10 w-[46rem] max-w-none opacity-90 md:-bottom-24" viewBox="0 0 700 300" fill="none" aria-hidden="true">
          <path d="M0 220C150 150 300 290 480 190S650 120 700 150" stroke="#E5D403" stroke-width="10" stroke-linecap="round" />
          <path d="M0 260C150 190 300 330 480 230S650 160 700 190" stroke="#E5D403" stroke-opacity=".28" stroke-width="26" stroke-linecap="round" />
        </svg>
        <div class="relative mx-auto grid max-w-6xl gap-8 px-4 pt-6 pb-24 md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-12 md:px-8 md:pt-12 md:pb-32">
          <div>
            <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-extrabold tracking-[0.14em] text-accent uppercase ring-1 ring-white/15">
              <AppIcon name="leaf" :size="15" />{{ campaign.name }}
            </span>
            <h1 class="mt-5 text-5xl leading-[0.95] font-black tracking-tight uppercase md:text-7xl">{{ campaign.headline }}</h1>
            <p class="mt-2 -rotate-1 text-6xl leading-none font-black tracking-tight text-accent uppercase md:text-8xl">{{ campaign.highlight }}</p>
            <p class="mt-6 max-w-md text-lg leading-7 text-white/80">{{ campaign.tagline }}</p>
            <p class="mt-3 text-xs text-white/50">{{ campaign.terms }}</p>
            <div class="mt-5 flex flex-wrap gap-2">
              <span v-for="badge in campaign.badges" :key="badge" class="rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-primary">{{ badge }}</span>
            </div>
          </div>
          <div class="relative">
            <div class="overflow-hidden rounded-[2.5rem] rounded-tl-[6rem] border-4 border-white/15 shadow-2xl shadow-black/30">
              <img :src="campaign.heroImage" alt="Evergro team member mowing a lawn" class="aspect-[4/3] w-full object-cover md:aspect-[4/5]" />
            </div>
            <div class="absolute -bottom-4 left-4 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-primary shadow-xl md:-left-6">
              <span class="grid size-10 place-items-center rounded-xl bg-accent"><AppIcon name="shield" :size="20" /></span>
              <span class="text-sm leading-tight font-extrabold">Fully insured<span class="block text-xs font-medium text-primary/55">Every visit</span></span>
            </div>
          </div>
        </div>
      </section>

      <!-- Address CTA -->
      <div class="relative z-10 -mt-16 bg-transparent px-4 md:-mt-20 md:px-8">
        <form class="mx-auto max-w-3xl rounded-[2rem] bg-white p-5 shadow-2xl shadow-primary/20 md:p-7" @submit.prevent="seePrice">
          <p class="text-lg font-black text-primary md:text-xl">Where’s your lawn?</p>
          <p class="mt-1 text-sm text-stone-500">Enter your address to see your price in under a minute.</p>
          <div class="mt-4 flex flex-col gap-3 md:flex-row">
            <label class="flex min-h-14 flex-1 items-center gap-3 rounded-2xl border border-primary/15 bg-stone-50 px-4 focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/8">
              <AppIcon name="pin" :size="20" class="shrink-0 text-primary" />
              <span class="sr-only">Your address</span>
              <input v-model="address" type="text" autocomplete="street-address" placeholder="Street, suburb, e.g. Sky City" class="w-full bg-transparent text-base text-primary outline-none placeholder:text-stone-400" />
            </label>
            <button type="submit" :disabled="busy" class="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-accent px-7 font-extrabold text-primary shadow-lg shadow-accent/30 transition active:scale-[0.98] disabled:opacity-60">
              {{ busy ? "Checking…" : "See my price" }}<AppIcon name="arrow" :size="18" />
            </button>
          </div>
          <p v-if="error" class="mt-3 text-sm font-semibold text-red-600" role="alert">{{ error }}</p>
          <div class="mt-4 flex gap-5 text-sm font-bold text-primary">
            <a href="#how" class="underline decoration-accent decoration-2 underline-offset-4">How it works</a>
            <a href="#faq" class="underline decoration-accent decoration-2 underline-offset-4">FAQs</a>
          </div>
        </form>
      </div>

      <div class="bg-[#f7f9f7]">
        <!-- Offers -->
        <section class="mx-auto max-w-6xl px-4 pt-16 md:px-8 md:pt-24">
          <p class="text-xs font-extrabold tracking-[0.16em] text-primary/45 uppercase">Choose your care</p>
          <h2 class="mt-2 max-w-xl text-3xl font-black tracking-tight text-primary md:text-4xl">Three simple packages. One fair price.</h2>
          <div class="mt-8 grid gap-4 md:grid-cols-3">
            <article v-for="(bundle, index) in bundles" :key="bundle.id" class="card-shadow relative rounded-3xl border bg-white p-6" :class="index === 2 ? 'border-primary' : 'border-primary/8'">
              <span v-if="index === 2" class="absolute -top-3 right-5 rounded-full bg-accent px-3 py-1 text-xs font-extrabold text-primary">Most popular</span>
              <p class="text-lg font-black text-primary">{{ bundle.name }}</p>
              <p class="text-sm text-stone-500">{{ bundle.tagline }}</p>
              <p class="mt-5 text-4xl font-black tracking-tight text-primary">R{{ from(bundle) }}<span class="text-sm font-bold text-primary/45"> per cut, from</span></p>
              <ul class="mt-5 space-y-2.5 border-t border-primary/8 pt-5">
                <li v-for="item in bundle.includes" :key="item" class="flex items-center gap-2.5 text-sm text-stone-700">
                  <span class="grid size-5 place-items-center rounded-full bg-primary-soft text-primary"><AppIcon name="check" :size="13" /></span>{{ item }}
                </li>
              </ul>
            </article>
          </div>
          <p class="mt-5 text-sm text-stone-500">Your final price depends on how much of your yard we cut: Essential, Standard or Complete.</p>
        </section>

        <!-- How it works -->
        <section id="how" class="mx-auto max-w-6xl scroll-mt-6 px-4 pt-16 md:px-8 md:pt-24">
          <p class="text-xs font-extrabold tracking-[0.16em] text-primary/45 uppercase">How it works</p>
          <h2 class="mt-2 text-3xl font-black tracking-tight text-primary md:text-4xl">From address to first cut in minutes.</h2>
          <ol class="mt-8 grid gap-4 md:grid-cols-4">
            <li v-for="(step, index) in steps" :key="step.id" class="rounded-3xl bg-primary p-6 text-white">
              <span class="grid size-11 place-items-center rounded-2xl bg-accent text-lg font-black text-primary">{{ index + 1 }}</span>
              <p class="mt-5 leading-6 font-semibold">{{ step.label }}</p>
            </li>
          </ol>
        </section>

        <!-- FAQs -->
        <section id="faq" class="mx-auto max-w-3xl scroll-mt-6 px-4 pt-16 md:px-8 md:pt-24">
          <p class="text-xs font-extrabold tracking-[0.16em] text-primary/45 uppercase">FAQs</p>
          <h2 class="mt-2 text-3xl font-black tracking-tight text-primary md:text-4xl">Good to know.</h2>
          <div class="card-shadow mt-8 divide-y divide-primary/8 rounded-3xl bg-white">
            <div v-for="(item, index) in faqs" :key="item.q">
              <button type="button" class="flex min-h-16 w-full items-center justify-between gap-4 px-5 py-4 text-left font-bold text-primary" :aria-expanded="openFaq === index" @click="openFaq = openFaq === index ? -1 : index">
                {{ item.q }}
                <AppIcon name="chevron" :size="18" class="shrink-0 transition" :class="openFaq === index ? 'rotate-90' : ''" />
              </button>
              <p v-if="openFaq === index" class="px-5 pb-5 text-sm leading-6 text-stone-600">{{ item.a }}</p>
            </div>
          </div>
        </section>

        <!-- Final CTA -->
        <section class="safe-bottom mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
          <div class="rounded-[2rem] bg-primary p-8 text-center text-white md:p-12">
            <p class="text-3xl font-black tracking-tight md:text-4xl">Ready for a lawn you’ll love?</p>
            <p class="mx-auto mt-3 max-w-md text-white/70">Claim the {{ campaign.name }} before the first 100 spots are gone.</p>
            <a href="#top" class="mt-6 inline-flex min-h-14 items-center gap-2 rounded-2xl bg-accent px-7 font-extrabold text-primary" @click.prevent="toTop">See my price<AppIcon name="arrow" :size="18" /></a>
            <p class="mt-6 text-sm text-white/60">Questions? WhatsApp {{ support.phone }}</p>
          </div>
        </section>
      </div>
      </div>
    </template>
  </PromoShell>
</template>

<style scoped>
.intro-in { animation: intro-in 0.4s ease-out; }
@keyframes intro-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .intro-in { animation: none; } }
</style>
