<template>
  <v-app>
    <v-main>
      <RouterView />
      <DialogBox />
      <Notification />
      <Overlay />
    </v-main>
  </v-app>
</template>

<script setup>
import Notification from './components/utils/Notification.vue';
import DialogBox from './components/utils/DialogBox.vue';
import Overlay from './components/utils/Overlay.vue';
</script>

<style scoped></style>
