<template>
  <v-snackbar
    v-model="showNotification"
    :color="color"
    location="bottom right"
    transition="fade-transition"
    :timeout="timeout"
    contained
  >
    <div class="d-flex align-center ga-2">
      <v-icon :icon="icon" /> <span>{{ message }}</span>
    </div>
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
import { ref, computed, watch, nextTick } from 'vue';
import { useNotificationStore } from '../../stores/utils/notificationStore.js';

const notificationStore = useNotificationStore();
const onReception = computed(() => notificationStore.isNotificationReceived);
// Layout
const showNotification = ref(false);
const message = ref('');
const color = ref('');
const icon = ref('');
const timeout = ref(3000); //default timeout

const setNotification = async () => {
  if (showNotification.value) {
    showNotification.value = false;
    await nextTick();
  }
  message.value = notificationStore.getNotification.message;
  const code = notificationStore.getNotification.code;
  const notificationType = code[0];
  switch (notificationType) {
    case 'S':
      color.value = 'success';
      icon.value = 'mdi-check-circle';
      break;
    case 'W':
      color.value = 'warning';
      icon.value = 'mdi-alert-circle';
      break;
    case 'E':
      color.value = 'error';
      icon.value = 'mdi-close-circle';
      break;
    case 'I':
      color.value = 'info';
      icon.value = 'mdi-information';
      break;
    default:
      color.value = 'error';
      icon.value = 'mdi-close-circle';
      break;
  }
  const mode = notificationStore.getNotification.mode;
  timeout.value = mode === 'persistent' ? -1 : 3000;
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
