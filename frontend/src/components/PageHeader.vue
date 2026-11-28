<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProfile } from "@/data/useProfile";
import AppIcon from "./AppIcon.vue";
import UserAvatar from "./UserAvatar.vue";

const route = useRoute();
const router = useRouter();
const profile = useProfile();
const deeper = computed(() => Boolean(route.meta.hideTabs));
const isSupport = computed(() => route.path === "/portal/support");
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
        <template v-if="profile.data">
          <UserAvatar :avatar="profile.data.avatar" :image="profile.data.image" class="size-10 rounded-full text-sm" />
          <span class="text-sm font-bold text-primary">{{ profile.data.name }}</span>
        </template>
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
