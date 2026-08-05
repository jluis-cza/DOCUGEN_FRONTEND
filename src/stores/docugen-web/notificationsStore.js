// Defines the inbox of an account (only read)
import { defineStore } from 'pinia';
import { ref, computed, toRaw } from 'vue';
import { deepMerge } from '../../helpers/utils.js';

export const useNotificationsStore = defineStore('notifications', () => {
  // States
  const notifications = ref([]);

  //Getters
  const getNotifications = computed(() => notifications.value);
  const getNotification = (id) => {
    const index = notifications.value.findIndex((n) => n._id === id);
    if (index !== -1) {
      return notifications.value[index];
    } else {
      return {};
    }
  };
  // Actions
  // const setNotifications = (data) => {
  //   notifications.value = data || [];
  // };
  const addNotifications = (data) => {
    if(data && data.length > 0) {
      // const chunk = [...data].reverse()
      // notifications.value.unshift(...chunk);
      notifications.value.push(...data);
    }
  };
  const setNotification = (id, options) => {
    const index = notifications.value.findIndex((n) => n._id === id);
    if (index !== -1) {
      notifications.value[index] = deepMerge(toRaw(notifications.value[index]), options);
    } else {
      // notifications.value.push(options);
      notifications.value.unshift(options);
      console.log('Se insertó un nuevo documento en el notificationsStore!!!');
    }
  };
  const resetNotifications = () => {
    notifications.value = [];
  };

  return {
    //Getters
    getNotifications,
    getNotification,
    //Actions
    addNotifications,
    setNotification,
    resetNotifications,
  };
});
