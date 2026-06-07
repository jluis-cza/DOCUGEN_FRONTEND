import { AdministrationService } from '../../services/docugen-web/AdministrationService.js';
import { ref, computed } from 'vue';
import { useServiceLookupsStore } from '../../stores/docugen-web/serviceLookupsStore.js';
import { useNotificationStore } from '../../stores/utils/notificationStore.js';

export const useServiceLookup = () => {
  // Notification setttings
  const notificationStore = useNotificationStore();
  const message = ref(null);
  const code = ref(null);
  // Default settings
  const serviceLookupsStore = useServiceLookupsStore();
  const serviceLookupId = ref('');
  const serviceLookup = computed(() => serviceLookupsStore.getServiceLookup(serviceLookupId.value));
  //  Request settings
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    serviceLookupSetter: async (id, payload) => {
      try {
        loading.value = true;
        serviceLookupId.value = id;
        const response = await AdministrationService.configServiceLookup(id, payload);
        serviceLookupsStore.setServiceLookup(id, response.data.data.serviceLookup);
        message.value = response?.data?.message || response.statusText;
        success.value = response?.data?.success || false;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        console.error(err);
        message.value =
          err.response?.data?.message || err.response.statusText || 'Error in serviceLookupSetter';
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
    serviceLookupGetter: async (id) => {
      try {
        loading.value = true;
        serviceLookupId.value = id;
        const response = await AdministrationService.monitorServiceLookup(id);
        serviceLookupsStore.setServiceLookup(id, response.data.data.serviceLookup);
        message.value = response?.data?.message || response.statusText;
        success.value = response?.data?.success;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        console.error(err);
        message.value =
          err.response?.data?.message || err.response.statusText || 'Error in serviceLookupGetter';
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

  return { serviceLookup, actions, loading, success, message, code };
};
