<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import AppButton from "@/components/AppButton.vue";
import AppIcon from "@/components/AppIcon.vue";
import { getMapConfig } from "@/services/promoApi";
import PromoShell from "./components/PromoShell.vue";
import { usePromoFlow } from "./usePromoFlow";

const router = useRouter();
const { state } = usePromoFlow();

const mode = ref<"confirm" | "trace">("confirm");
const config = ref({ latitude: 0, traceZoom: 20, confirmZoom: 19, autoAreaM2: 0 });
const points = ref<{ x: number; y: number }[]>([]);
const surface = ref<HTMLElement>();
const mapReady = ref(false);

onMounted(async () => (config.value = await getMapConfig()));

const zoom = computed(() => (mode.value === "trace" ? config.value.traceZoom : config.value.confirmZoom));
const mapSrc = computed(
  () => `https://maps.google.com/maps?q=${encodeURIComponent(state.address)}&t=k&z=${zoom.value}&output=embed`,
);

// Web-mercator ground resolution (metres per CSS pixel) at the property latitude.
const metresPerPixel = computed(
  () => (156543.03392 * Math.cos((config.value.latitude * Math.PI) / 180)) / Math.pow(2, zoom.value),
);
const area = computed(() => {
  const pts = points.value;
  if (pts.length < 3) return 0;
  let sum = 0;
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % pts.length];
    sum += p.x * q.y - q.x * p.y;
  });
  return Math.round((Math.abs(sum) / 2) * metresPerPixel.value ** 2);
});
const polygon = computed(() => points.value.map((p) => `${p.x},${p.y}`).join(" "));

function addPoint(event: PointerEvent) {
  const rect = surface.value?.getBoundingClientRect();
  if (!rect) return;
  points.value.push({ x: event.clientX - rect.left, y: event.clientY - rect.top });
}

function finish(method: "traced" | "auto") {
  state.areaMethod = method;
  state.lawnArea = method === "traced" ? area.value : config.value.autoAreaM2;
  router.push("/start/details");
}
</script>

<template>
  <PromoShell :step="1" :steps="3">
    <div class="mx-auto flex min-h-[calc(100dvh-6rem)] max-w-3xl flex-col gap-4 px-4 pt-4 pb-4 md:min-h-0 md:px-8 md:pt-10 md:pb-10">
      <div>
        <p class="text-xs font-extrabold tracking-[0.16em] text-primary/45 uppercase">{{ mode === "confirm" ? "Confirm your home" : "Trace your lawn" }}</p>
        <h1 class="mt-1 text-2xl font-black tracking-tight text-primary md:text-3xl">
          {{ mode === "confirm" ? "Is this your home?" : "Tap around the grass you want cut" }}
        </h1>
        <p class="mt-1 flex items-center gap-1.5 text-sm text-stone-500"><AppIcon name="pin" :size="15" class="shrink-0" />{{ state.address }}</p>
      </div>

      <div
        ref="surface"
        class="relative min-h-72 flex-1 overflow-hidden rounded-3xl border border-primary/10 bg-primary-soft md:h-[28rem] md:flex-none"
      >
        <div class="absolute inset-0 grid place-items-center bg-[repeating-linear-gradient(45deg,transparent,transparent_14px,rgba(7,59,36,0.04)_14px,rgba(7,59,36,0.04)_28px)]" :class="mapReady ? 'opacity-0' : ''">
          <span class="flex items-center gap-2 text-sm font-bold text-primary/50"><AppIcon name="map" :size="18" />Loading map…</span>
        </div>
        <iframe
          :key="mapSrc"
          :src="mapSrc"
          title="Map preview of your property"
          class="absolute inset-0 size-full border-0"
          :class="mode === 'trace' ? 'pointer-events-none' : ''"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          @load="mapReady = true"
        />
        <svg v-if="mode === 'trace'" class="absolute inset-0 size-full cursor-crosshair touch-none" @pointerdown.prevent="addPoint">
          <polygon v-if="points.length > 2" :points="polygon" fill="rgba(229,212,3,0.32)" stroke="#E5D403" stroke-width="3" stroke-linejoin="round" />
          <polyline v-else-if="points.length > 1" :points="polygon" fill="none" stroke="#E5D403" stroke-width="3" />
          <circle v-for="(p, i) in points" :key="i" :cx="p.x" :cy="p.y" r="7" fill="#fff" stroke="#073B24" stroke-width="3" />
        </svg>
        <div v-if="mode === 'trace'" class="pointer-events-none absolute top-3 left-3 rounded-full bg-primary/90 px-3 py-1.5 text-xs font-bold text-white">
          {{ points.length < 3 ? "Tap at least 3 corners" : `About ${area} m²` }}
        </div>
      </div>

      <div v-if="mode === 'confirm'" class="space-y-3">
        <AppButton @click="mode = 'trace'">Yes, that’s my home</AppButton>
        <router-link to="/promo" class="block"><AppButton variant="secondary">Change address</AppButton></router-link>
      </div>
      <div v-else class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <AppButton variant="secondary" :disabled="!points.length" @click="points.pop()"><AppIcon name="undo" :size="17" />Undo</AppButton>
          <AppButton variant="secondary" :disabled="!points.length" @click="points = []"><AppIcon name="trash" :size="17" />Clear</AppButton>
        </div>
        <AppButton :disabled="points.length < 3" @click="finish('traced')">Use my tracing</AppButton>
        <AppButton variant="secondary" @click="finish('auto')"><AppIcon name="target" :size="18" />Calculate automatically</AppButton>
      </div>
    </div>
  </PromoShell>
</template>
