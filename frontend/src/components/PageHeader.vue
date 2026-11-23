<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getCustomer } from "@/services/mockApi";
import AppIcon from "./AppIcon.vue";

const route = useRoute();
const router = useRouter();
const customer = ref({ name: "", avatar: "" });
const deeper = computed(() => Boolean(route.meta.hideTabs));
const isSupport = computed(() => route.path === "/portal/support");

onMounted(async () => {
  const data = await getCustomer();
  customer.value = { name: data.name, avatar: data.avatar };
});
</script>

<template>
  <header
    class="safe-top border-b border-primary/8 bg-white/90 backdrop-blur-xl"
    :class="deeper ? 'block' : 'hidden md:block'"
  >
    <div class="mx-auto flex h-18 max-w-6xl items-center gap-3 px-4 md:h-20 md:px-8">
      <button
        v-if="deeper"
        type="button"
        class="grid size-11 shrink-0 place-items-center rounded-xl text-primary hover:bg-primary-soft md:hidden"
        aria-label="Go back"
        @click="router.back()"
      >
        <AppIcon name="back" />
      </button>
      <div class="hidden min-w-56 items-center gap-3 md:flex">
        <span class="grid size-10 place-items-center rounded-full bg-primary text-sm font-bold text-white">{{ customer.avatar }}</span>
        <span class="text-sm font-bold text-primary">{{ customer.name }}</span>
      </div>
      <div class="flex flex-1 items-center gap-2 md:justify-center">
        <button
          v-if="deeper"
          type="button"
          class="hidden size-10 place-items-center rounded-xl text-primary hover:bg-primary-soft md:grid"
          aria-label="Go back"
          @click="router.back()"
        >
          <AppIcon name="back" :size="20" />
        </button>
        <p v-if="deeper" class="text-lg font-extrabold text-primary md:text-xl">{{ route.meta.title }}</p>
      </div>
      <div class="hidden min-w-56 justify-end md:flex">
        <router-link
          v-if="!isSupport"
          to="/portal/support"
          class="flex min-h-11 items-center gap-2 rounded-xl border border-primary/12 px-4 text-sm font-bold text-primary hover:bg-primary-soft"
        >
          <AppIcon name="message" :size="18" />
          Support
        </router-link>
      </div>
    </div>
  </header>
</template>
