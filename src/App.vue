<template>
  <v-app>
    <v-main>
      <RouterView />
      <Notification />
      <Overlay />
    </v-main>
  </v-app>
</template>

<script setup>
import Notification from './components/Notification.vue';
import Overlay from './components/Overlay.vue';
</script>

<style scoped></style>
