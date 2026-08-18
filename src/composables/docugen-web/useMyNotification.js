import { ref, computed } from 'vue';
import { ManagementService } from '../../services/docugen-web/ManagementService.js';
import { useMyNotificationsStore } from '../../stores/docugen-web/myNotificationsStore.js';

export const useMyNotification = () => {
  // Notification setttings
  const message = ref(null);
  const code = ref(null);
  //  Request settings
  const myNotificationsStore = useMyNotificationsStore();
  const myNotification = computed(() => myNotificationsStore.getMyNotifications);
  // Petition settings
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    notificationAcknowledger: async (id) => {
      try {
        loading.value = true;
        const notificationId = typeof id === 'string' ? id : id?.id || id?._id;
        if (!notificationId) throw new Error('Notification id is required');

        const response = await ManagementService.acknowledgeNotification(notificationId);
        myNotificationsStore.setMyNotification(notificationId, response.data.data.notification);
        message.value = response?.data?.message || response.statusText;
        success.value = response?.data?.success || false;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        console.error(err);
        message.value =
          err.response?.data?.message ||
          err.response.statusText ||
          'Error in notificationAcknowledger';
        success.value = err.response?.data?.success || false;
        code.value = err.response?.data?.code || 'EXXX';
      } finally {
        loading.value = false;
      }
    },
  };

  return { myNotification, actions, loading, success, message, code };
};
