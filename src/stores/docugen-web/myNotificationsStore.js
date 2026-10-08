// Defines the own inbox with automatic ack
import { defineStore } from 'pinia';
import { ref, computed, toRaw } from 'vue';
import { deepMerge } from '../../helpers/utils.js';

export const useMyNotificationsStore = defineStore('myNotifications', () => {
  // States
  const myNotifications = ref([]);

  //Getters
  const getMyNotifications = computed(() => myNotifications.value);

  // Actions
  const normalizeNotification = (notification) => {
    if (!notification || typeof notification !== 'object') return notification;

    return {
      ...notification,
      subject: notification.subject || 'Sin asunto',
      message: notification.message || 'Sin mensaje',
      from: notification.from || 'Sistema',
      status: notification.status || 'sent',
    };
  };

  const setMyNotifications = (data) => {
    myNotifications.value = Array.isArray(data) ? data.map(normalizeNotification) : [];
  };
  const appendMyNotifications = (data) => {
    if (!Array.isArray(data) || data.length === 0) return;

    const existingIds = new Set(myNotifications.value.map((notification) => notification._id));
    const newNotifications = data
      .filter((notification) => !existingIds.has(notification?._id))
      .map(normalizeNotification);

    myNotifications.value.push(...newNotifications);
  };
  const setMyNotification = (id, options) => {
    const index = myNotifications.value.findIndex((a) => a._id === id);
    if (index !== -1) {
      myNotifications.value[index] = deepMerge(toRaw(myNotifications.value[index]), options);
    } else {
      myNotifications.value.push(options);
      console.log('Se insertó un nuevo documento en el myNotificationsStore!!!');
    }
  };
  const countMyNewNotifications = () => {
    let count = 0;
    count = myNotifications.value.filter((n) => n.status === 'sent')?.length || 0;
    return count;
  };
  const resetMyNotifications = () => {
    myNotifications.value = [];
  };

  return {
    //Getters
    getMyNotifications,
    //Actions
    setMyNotifications,
    appendMyNotifications,
    setMyNotification,
    countMyNewNotifications,
    resetMyNotifications,
  };
});
