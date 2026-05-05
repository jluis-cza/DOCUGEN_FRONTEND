import { ref } from 'vue';
import { AdmissionService } from '../../services/docugen-web/AdmissionService.js';
import { useNotificationStore } from '../../stores/notificationStore.js';

export const useMyAccount = () => {
  // Notification setttings
  const notificationStore = useNotificationStore();
  const message = ref(null);
  const code = ref(null);
  //  Request settings
  const myAccount = ref(null);
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    myAccountRegister: async (payload) => {
      try {
        loading.value = true;
        const response = await AdmissionService.registerMyAccount(payload);
        myAccount.value = response.data.data.account;
        message.value = response?.data?.message || response.statusText;
        success.value = response?.data?.success || false;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        message.value = err.response?.data?.message || err.response.statusText;
        success.value = err.response?.data?.success || false;
        code.value = err.response?.data?.code || 'EXXX';
      } finally {
        // Notification settings
        const data = {
          message: message.value,
          code: code.value,
          mode: 'persistent',
        };
        notificationStore.setNotification(data);
        loading.value = false;
      }
    },
  };

  return { myAccount, actions, loading, success, message, code };
};
