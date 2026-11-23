<script setup lang="ts">
import ThumbPage from "@/components/ThumbPage.vue";
import AppCard from "@/components/AppCard.vue";
import ListRow from "@/components/ListRow.vue";
</script>

<template>
  <ThumbPage>
    <AppCard class="!py-1">
      <ListRow label="Emails" icon="message" to="/portal/account/notifications/email" />
      <ListRow label="WhatsApp" icon="phone" to="/portal/account/notifications/whatsapp" />
    </AppCard>
  </ThumbPage>
</template>
