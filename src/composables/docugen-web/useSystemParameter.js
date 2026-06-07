import { AdministrationService } from '../../services/docugen-web/AdministrationService.js';
import { ref, computed } from 'vue';
import { useSystemParametersStore } from '../../stores/docugen-web/systemParametersStore.js';
import { useNotificationStore } from '../../stores/utils/notificationStore.js';

export const useSystemParameter = () => {
  //  Notification settings
  const notificationStore = useNotificationStore();
  const message = ref(null);
  const code = ref(null);
  // Default settings
  const systemParametersStore = useSystemParametersStore();
  const systemParameterId = ref('');
  const systemParameter = computed(() =>
    systemParametersStore.getSystemParameter(systemParameterId.value)
  );
  //  Petition settings
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    systemParameterSetter: async (id, payload) => {
      try {
        loading.value = true;
        systemParameterId.value = id;
        const response = await AdministrationService.configSystemParameter(id, payload);
        systemParametersStore.setSystemParameter(id, response.data.data.systemParameter);
        message.value = response?.data?.message || response.statusText;
        success.value = response?.data?.success;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        console.error(err);
        message.value =
          err.response?.data?.message ||
          err.response.statusText ||
          'Error in systemParameterSetter';
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
    systemParameterGetter: async (id) => {
      try {
        loading.value = true;
        systemParameterId.value = id;
        const response = await AdministrationService.monitorSystemParameter(id);
        systemParametersStore.setSystemParameter(id, response.data.data.systemParameter);
        message.value = response?.data?.message || response.statusText;
        success.value = response?.data?.success;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        console.error(err);
        message.value =
          err.response?.data?.message ||
          err.response.statusText ||
          'Error in systemParameterGetter';
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
