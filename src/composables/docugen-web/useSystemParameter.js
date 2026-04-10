import { AdministrationService } from '../../services/docugen-web/AdministrationService.js';
import { ref } from 'vue';
import { useNotificationStore } from '../../stores/notificationStore.js';

export const useSystemParameter = () => {
  //  Notification settings
  const notificationStore = useNotificationStore();
  const message = ref(null);
  const code = ref(null);
  //  Petition settings
  const systemParameter = ref({});
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    systemParameterSetter: async (payload) => {
      try {
        loading.value = true;
        const response = await AdministrationService.configSystemParameter(payload);
        message.value = response?.data?.message || response.statusText;
        success.value = response?.data?.success;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        console.error(err);
        message.value = err.response?.data?.message || err.response.statusText;
        success.value = err.response?.data?.success;
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
  return {
    systemParameter,
    actions,
    loading,
    success,
    message,
    code,
  };
};
