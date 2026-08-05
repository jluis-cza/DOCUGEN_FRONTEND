// Defines the frontend popup single and passing notification
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { SERVICES } from '../../constants/services.js';

const notificationDefaultData = { ...SERVICES.payload.utils.notification };

export const useNotificationStore = defineStore('notification', () => {
  // States
  const notification = ref(notificationDefaultData);
  const notificationReceived = ref(false);
  // let _resolve = null; //It is resolved when the notification is reset

  //Getters
  const getNotification = computed(() => notification.value);
  const isNotificationReceived = computed(() => notificationReceived.value);
  // Actions
  const setNotification = (data) => {
    notification.value = data || {};
    notificationReceived.value = true;
    // return new Promise((resolve) => {
    //   _resolve = resolve;
    // });
  };

  const resetNotification = () => {
    notification.value = notificationDefaultData;
    notificationReceived.value = false;
    // if (_resolve) {
    //   _resolve();
    //   _resolve = null;
    // }
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
