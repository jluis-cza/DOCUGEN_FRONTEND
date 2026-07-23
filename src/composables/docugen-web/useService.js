import { AdministrationService } from '../../services/docugen-web/AdministrationService.js';
import { ref, computed } from 'vue';
import { useServicesStore } from '../../stores/docugen-web/servicesStore.js';
import { useNotificationStore } from '../../stores/utils/notificationStore.js';

export const useService = () => {
  // Notification setttings
  const notificationStore = useNotificationStore();
  const message = ref(null);
  const code = ref(null);
  // Default settings
  const servicesStore = useServicesStore();
  const serviceId = ref('');
  const service = computed(() => servicesStore.getService(serviceId.value));
  //  Request settings
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    serviceSetter: async (id, payload) => {
      try {
        loading.value = true;
        serviceId.value = id;
        const response = await AdministrationService.configService(id, payload);
        servicesStore.setService(id, response.data.data.service);
        message.value = response?.data?.message || response.statusText;
        success.value = response?.data?.success || false;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        console.error(err);
        message.value =
          err.response?.data?.message || err.response.statusText || 'Error in serviceSetter';
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

  return { service, actions, loading, success, message, code };
};
