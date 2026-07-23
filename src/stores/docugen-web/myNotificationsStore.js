import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useMyNotificationsStore = defineStore('myNotifications', () => {
  // States
  const myNotifications = ref([]);

  //Getters
  const getAllMyNotifications = computed(() => myNotifications.value);

  // Actions
  const setMyNotifications = (data) => {
    myNotifications.value = data || [];
  };

  const resetMyNotifications = () => {
    myNotifications.value = [];
  };

  return {
    //Getters
    getAllMyNotifications,
    //Actions
    setMyNotifications,
    resetMyNotifications,
  };
});
