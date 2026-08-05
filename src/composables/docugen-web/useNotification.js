import { ref, computed } from 'vue';
import { ManagementService } from '../../services/docugen-web/ManagementService.js';
import { useNotificationsStore } from '../../stores/docugen-web/notificationsStore.js'; // inbox notifications
import { useNotificationStore } from '../../stores/utils/notificationStore.js'; //popup message

export const useNotification = () => {
  // Notification setttings
  const notificationStore = useNotificationStore();
  const message = ref(null);
  const code = ref(null);
  //  Request settings
  const notificationsStore = useNotificationsStore();
  const notificationId = ref('');
  const notification = computed(() => notificationsStore.getNotification(notificationId));
  // Petition settings
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    notificationCreator: async (payload) => {
      try {
        loading.value = true;
        const response = await ManagementService.createNotification(payload);
        notificationId.value = response.data.data.notification._id;
        notificationsStore.setNotification(notificationId.value, response.data.data.notification);
        message.value = response?.data?.message || response.statusText;
        success.value = response?.data?.success || false;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        console.error(err);
        message.value =
          err.response?.data?.message || err.response.statusText || 'Error in notificationCreator';
        success.value = err.response?.data?.success || false;
        code.value = err.response?.data?.code || 'EXXX';
      } finally {
        loading.value = false;
        const data = {
          message: message.value,
          code: code.value,
          mode: 'automatic',
        };
        notificationStore.setNotification(data);
      }
    },
  };

  return { notification, actions, loading, success, message, code };
};
