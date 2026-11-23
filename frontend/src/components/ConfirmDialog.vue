<script setup lang="ts">
import AppButton from "./AppButton.vue";
defineProps<{ open: boolean }>();
defineEmits<{ close: []; confirm: [] }>();
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 grid place-items-center bg-primary/40 p-5 backdrop-blur-sm" @click.self="$emit('close')">
    <section class="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true">
      <p class="text-xl font-extrabold text-primary">Log out?</p>
      <p class="mt-2 text-sm leading-6 text-stone-600">You’ll need to sign in again to access your account.</p>
      <div class="mt-6 flex gap-3">
        <AppButton variant="secondary" @click="$emit('close')">Cancel</AppButton>
        <AppButton variant="danger" @click="$emit('confirm')">Log out</AppButton>
      </div>
    </section>
  </div>
</template>
