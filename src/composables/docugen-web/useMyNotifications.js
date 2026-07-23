import { ref, computed } from 'vue';
import { ManagementService } from '../../services/docugen-web/ManagementService.js';
import { useMyNotificationsStore } from '../../stores/docugen-web/myNotificationsStore.js';

export const useMyNotifications = () => {
  // Notification setttings
  const message = ref(null);
  const code = ref(null);
  //  Request settings
  const myNotificationsStore = useMyNotificationsStore();
  const myNotifications = computed(() => myNotificationsStore.getMyProfile);
  // Petition settings
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    myNotificationsGetter: async (id) => {
      try {
        loading.value = true;
        const response = await ManagementService.getNotifications(id);
        myNotificationsStore.setMyNotifications(response.data.data.notifications);
        message.value = response?.data?.message || response.statusText;
        success.value = response?.data?.success || false;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        console.error(err);
        message.value =
          err.response?.data?.message || err.response.statusText || 'Error in myNotificationsGetter';
        success.value = err.response?.data?.success || false;
        code.value = err.response?.data?.code || 'EXXX';
      } finally {
        loading.value = false;
      }
    },
  };

  return { myNotifications, actions, loading, success, message, code };
};
