import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { SERVICES } from '../../constants/services.js';

const notificationDefaultData = { ...SERVICES.payload.utils.notification };

export const useNotificationStore = defineStore('notification', () => {
  // States
  const notification = ref(notificationDefaultData);
  const notificationReceived = ref(false);

  //Getters
  const getNotification = computed(() => notification.value);
  const isNotificationReceived = computed(() => notificationReceived.value);
  // Actions
  const setNotification = (data) => {
    notification.value = data || {};
    notificationReceived.value = true;
  };
  const resetNotification = () => {
    notification.value = notificationDefaultData;
    notificationReceived.value = false;
  };

  return {
    //Getters
    getNotification,
    isNotificationReceived,
    //Actions
    setNotification,
    resetNotification,
  };
});
