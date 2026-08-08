import { ref, computed } from 'vue';
import { ManagementService } from '../../services/docugen-web/ManagementService.js';
import { useMyNotificationsStore } from '../../stores/docugen-web/myNotificationsStore.js';
import { useListsStore } from '../../stores/utils/listsStore.js';

export const useMyNotifications = () => {
  // Notification setttings
  const message = ref(null);
  const code = ref(null);
  //  Request settings
  const myNotificationsStore = useMyNotificationsStore();
  const listStore = useListsStore();
  const myNotifications = computed(() => myNotificationsStore.getMyNotifications);
  const listId = 1;
  // Petition settings
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    notificationsGetter: async (params) => {
      try {
        loading.value = true;
        const response = await ManagementService.getNotifications(params);
        myNotificationsStore.addMyNotifications(response.data.data.notifications);
        listStore.setList(listId, response.data.metadata.notifications);
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
    notificationsCounter: async (params) => {
      try {
        loading.value = true;
        const response = await ManagementService.countNotifications(params);
        myNotificationsStore.resetMyNotificationsCount();
        myNotificationsStore.setMyNotificationsCount(response.data.data.notificationsCount);
        message.value = response?.data?.message || response.statusText;
        success.value = response?.data?.success || false;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        console.error(err);
        message.value =
          err.response?.data?.message || err.response.statusText || 'Error in notificationsCounter';
        success.value = err.response?.data?.success || false;
        code.value = err.response?.data?.code || 'EXXX';
      } finally {
        loading.value = false;
      }
    },
  };
  return { myNotifications, actions, loading, success, message, code };
};
