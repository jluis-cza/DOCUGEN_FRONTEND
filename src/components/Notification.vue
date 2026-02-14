<template>
  <v-snackbar
    v-model="showNotification"
    :color="color"
    location="bottom right"
    transition="fade-transition"
    :timeout="5000"
    @update:model-value="onClose"
  >
    {{ message }}
  </v-snackbar>
</template>
<script setup>
import { ref, computed, watch } from 'vue';
import { useNotificationStore } from '../stores/notificationStore.js';

const notification = useNotificationStore();
const showNotification = ref(false);
const onReception = computed(() => notification.isNotificationReceived);
const message = computed(() => notification.getNotification.message || 'NA');
const code = computed(() => notification.getNotification.code || 'NA');
const color = computed(() => {
  const notificationType = code.value[0];
  switch (notificationType) {
    case 'S':
      return 'success';
    case 'W':
      return 'warning';
    case 'E':
      return 'error';
    case 'I':
      return 'info';
    default:
      return 'info';
  }
});
watch(onReception, (newValue, oldValue) => {
  if (oldValue === false && newValue === true) showNotification.value = true;
});
const onClose = async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  await sleep(2000); //2 seconds
  notification.resetNotification();
};
</script>
