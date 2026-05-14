import { ref } from 'vue';
import { AdministrationService } from '../../services/docugen-web/AdministrationService.js';
import { useNotificationStore } from '../../stores/notificationStore.js';
import { useAccountsStore } from '../../stores/docugen-web/accountsStore.js';

export const useAccount = () => {
  // Notification setttings
  const notificationStore = useNotificationStore();
  const message = ref(null);
  const code = ref(null);
  //  Request settings
  const accountsStore = useAccountsStore();
  const account = ref(null);
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    accountSetter: async (id, payload) => {
      try {
        loading.value = true;
        const response = await AdministrationService.configAccount(id, payload);
        accountsStore.setAccount(id, response.data.data.account);
        message.value = response?.data?.message || response.statusText;
        success.value = response?.data?.success || false;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        console.error(err);
        message.value =
          err.response?.data?.message || err.response.statusText || 'Error in accountSetter';
        success.value = err.response?.data?.success || false;
        code.value = err.response?.data?.code || 'EXXX';
      } finally {
        const data = {
          message: message.value,
          code: code.value,
          mode: 'automatic',
        };
        notificationStore.setNotification(data);
        loading.value = false;
      }
    },
  };

  return { account, actions, loading, success, message, code };
};
