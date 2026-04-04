<template>
  <v-snackbar
    v-model="showNotification"
    :color="color"
    location="bottom right"
    transition="fade-transition"
    :timeout="timeout"
  >
    {{ message }}
    <template v-slot:actions>
      <v-btn
        color="white"
        variant="text"
        density="compact"
        icon="mdi-close"
        @click="showNotification = false"
      ></v-btn>
    </template>
  </v-snackbar>
</template>
<script setup>
import { ref, computed, watch } from 'vue';
import { useNotificationStore } from '../stores/notificationStore.js';

const notificationStore = useNotificationStore();
const showNotification = ref(false);
const message = ref('');
const color = ref('');
const timeout = ref(3000); //default timeout
const onReception = computed(() => notificationStore.isNotificationReceived);

const setNotification = () => {
  message.value = notificationStore.getNotification.message;
  const code = notificationStore.getNotification.code;
  const notificationType = code[0];
  switch (notificationType) {
    case 'S':
      color.value = 'success';
      break;
    case 'W':
      color.value = 'warning';
      break;
    case 'E':
      color.value = 'error';
      break;
    case 'I':
      color.value = 'info';
      break;
    default:
      color.value = 'error';
      break;
  }
  const mode = notificationStore.getNotification.mode;
  if(mode === "persistent") timeout.value = -1
  showNotification.value = true;
};

watch(onReception, (newValue, oldValue) => {
  if (oldValue === false && newValue === true) setNotification();
});

// Cleaning the notification store when removed
watch(showNotification, (newValue, oldValue) => {
  if (oldValue === true && newValue === false) notificationStore.resetNotification();
});
</script>
