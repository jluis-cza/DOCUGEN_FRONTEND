<template>
  <v-snackbar
    v-model="isVisible"
    :color="color"
    location="bottom right"
    transition="fade-transition"
    :timeout="timeout"
    contained
    @after-leave="handleAfterLeave"
  >
    <div class="d-flex align-center ga-2">
      <v-icon :icon="icon" />
      <template v-if="isSuspensionNotice">
        <span>Cuenta suspendida.</span>
        <a href="/qa" class="text-white font-weight-bold" @click.prevent="closeAndGo('/qa')"
          >Más información</a
        >
      </template>
      <template v-else-if="isServiceUnavailableNotice">
        <span>{{ serviceNoticeText }}</span>
        <a
          :href="serviceNoticeLink"
          class="text-white font-weight-bold"
          @click.prevent="closeAndGo(serviceNoticeLink)"
        >
          Más información
        </a>
      </template>
      <span v-else>{{ notification.message }}</span>
    </div>
    <template v-slot:actions>
      <v-btn
        color="white"
        variant="text"
        density="compact"
        icon="mdi-close"
        @click="isVisible = false"
      ></v-btn>
    </template>
  </v-snackbar>
</template>
<script setup>
import { computed, ref, watch } from 'vue';
import { useNotificationStore } from '../../stores/utils/notificationStore.js';

const notificationStore = useNotificationStore();
const notification = ref({ message: '', code: '', mode: '' });
const isVisible = ref(false);

watch(
  () => (notificationStore.isNotificationReceived ? notificationStore.getNotification : null),
  (receivedNotification) => {
    if (!receivedNotification) return;
    notification.value = { ...receivedNotification };
    isVisible.value = true;
  },
  { immediate: true }
);

const closeAndGo = (path) => {
  isVisible.value = false;
  window.location.href = path;
};

const handleAfterLeave = () => {
  if (isVisible.value) return;
  notificationStore.resetNotification();
  notification.value = { message: '', code: '', mode: '' };
};

const isSuspensionNotice = computed(() => notification.value.code === 'E0170');
const serviceNoticeText = computed(() => {
  const messages = {
    E0820: 'Servicio de edición de plantillas no disponible.',
    E0821: 'Servicio de generación de documentos no disponible.',
  };
  return messages[notification.value.code] || notification.value.message;
});
const isServiceUnavailableNotice = computed(() => ['E0820', 'E0821'].includes(notification.value.code));
const serviceNoticeLink = computed(() =>
  notification.value.code === 'E0820' ? '/qa#service-edition' : '/qa#service-generation'
);
const color = computed(() => {
  const colors = { S: 'success', W: 'warning', E: 'error', I: 'info' };
  return colors[notification.value.code?.[0]] || 'error';
});
const icon = computed(() => {
  const icons = {
    S: 'mdi-check-circle',
    W: 'mdi-alert-circle',
    E: 'mdi-close-circle',
    I: 'mdi-information',
  };
  return icons[notification.value.code?.[0]] || 'mdi-close-circle';
});
const timeout = computed(() => (notification.value.mode === 'persistent' ? -1 : 3000));
</script>
