// Defines the own inbox with automatic ack
import { defineStore } from 'pinia';
import { ref, computed, toRaw } from 'vue';
import { deepMerge } from '../../helpers/utils.js';

export const useMyNotificationsStore = defineStore('myNotifications', () => {
  // States
  const myNotifications = ref([]);
  const myNotificationsCount = ref(0);

  //Getters
  const getMyNotifications = computed(() => myNotifications.value);
  const getMyNotification = (id) => {
    const index = myNotifications.value.findIndex((n) => n._id === id);
    if (index !== -1) {
      return myNotifications.value[index];
    } else {
      return {};
    }
  };
  const getMyNotificationsCount = computed(() => myNotificationsCount.value);

  // Actions
  const addMyNotifications = (data) => {
    if (data && data.length > 0) {
      myNotifications.value.push(...data);
    }
  };
  const setMyNotification = (id, options) => {
    const index = myNotifications.value.findIndex((a) => a._id === id);
    if (index !== -1) {
      myNotifications.value[index] = deepMerge(toRaw(myNotifications.value[index]), options);
    } else {
      myNotifications.value.unshift(options);
      console.log('Se insertó un nuevo documento en el myNotificationsStore!!!');
    }
  };
  const setMyNotificationsCount = (count) => {
    if (typeof count !== 'number')
      console.error('La acción "setMyNotificationsCount" debe tener un "count" numerico.');
    myNotificationsCount.value = count || 0;
  };
  const decreaseMyNotificationsCount = (step) => {
    if (typeof step !== 'number')
      console.error(
        "El parámetro 'step' de la acción 'decreaseMyNotificationsCount' debe ser numerico."
      );
    myNotificationsCount.value = myNotificationsCount.value - step;
  };
  const countMyNewNotifications = () => {
    let count = 0;
    count = myNotifications.value.filter((n) => n.status === 'sent')?.length || 0;
    return count;
  };
  const resetMyNotifications = () => {
    myNotifications.value = [];
  };
  const resetMyNotificationsCount = () => {
    myNotificationsCount.value = 0;
  };
  return {
    //Getters
    getMyNotifications,
    getMyNotification,
    getMyNotificationsCount,
    //Actions
    addMyNotifications,
    setMyNotification,
    setMyNotificationsCount,
    decreaseMyNotificationsCount,
    countMyNewNotifications,
    resetMyNotifications,
    resetMyNotificationsCount,
  };
});
