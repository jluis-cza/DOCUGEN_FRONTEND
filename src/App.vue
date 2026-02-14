<template>
  <v-app>
    <v-main>
      <RouterView />
      <Notification />
    </v-main>
  </v-app>
</template>

<script setup>
import Notification from './components/Notification.vue';
</script>

<style scoped></style>
