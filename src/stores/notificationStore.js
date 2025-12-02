// import { defineStore } from 'pinia';
// import { ref, computed } from 'vue';

// export const useNotificationStore = defineStore('notification', () => {
//   // States
//   const notification = ref({});
//   const notificationReceived = ref(null);
//   //Getters
//   const getNotification = computed(() => notification.value);
//   const isNotificationReceived = computed(() => notificationReceived.value);
//   // Actions
//   const setNotification = (data) => {
//     notification.value = data || {};
//     notificationReceived.value = true;
//     return notification;
//   };
//   const resetNotification = () => {
//     notification.value = {};
//     return notification;
//   };

//   return {
//     //States
//     notification,
//     notificationReceived,
//     //Getters
//     getNotification,
//     isNotificationReceived,
//     //Actions
//     setNotification,
//     resetNotification,
//   };
// });
