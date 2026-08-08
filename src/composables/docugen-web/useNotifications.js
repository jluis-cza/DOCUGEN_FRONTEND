import { ref, computed } from 'vue';
import { ManagementService } from '../../services/docugen-web/ManagementService.js';
import { useNotificationsStore } from '../../stores/docugen-web/notificationsStore.js';
import { useListsStore } from '../../stores/utils/listsStore.js';

export const useNotifications = () => {
  // Notification setttings
  const message = ref(null);
  const code = ref(null);
  //  Request settings
  const notificationsStore = useNotificationsStore();
  const listsStore = useListsStore();
  const notifications = computed(() => notificationsStore.getNotifications);
  const listId = 2;
  // Petition settings
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    notificationsGetter: async (params) => {
      try {
        loading.value = true;
        const response = await ManagementService.getNotifications(params);
        notificationsStore.addNotifications(response.data.data.notifications);
        // listsStore.resetList(listId)
        listsStore.setList(listId, response.data.metadata.notifications);
        message.value = response?.data?.message || response.statusText;
        success.value = response?.data?.success || false;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        console.error(err);
        message.value =
          err.response?.data?.message || err.response.statusText || 'Error in notificationsGetter';
        success.value = err.response?.data?.success || false;
        code.value = err.response?.data?.code || 'EXXX';
      } finally {
        loading.value = false;
      }
    },
  };

  return { notifications, actions, loading, success, message, code };
};
