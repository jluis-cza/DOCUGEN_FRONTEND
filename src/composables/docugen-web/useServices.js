import { ref, computed } from 'vue';
import { AdministrationService } from '../../services/docugen-web/AdministrationService.js';
import { useTablesStore } from '../../stores/utils/tablesStore.js';
import { useServicesStore } from '../../stores/docugen-web/servicesStore.js';

export const useServices = () => {
  // Notification setttings
  const message = ref(null);
  const code = ref(null);
  // Default settings
  const servicesStore = useServicesStore();
  const tablesStore = useTablesStore();
  const tableId = 5; //  Services table id
  //  Request settings
  const services = computed(() => servicesStore.getServices);
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    servicesGetter: async (id, params) => {
      try {
        loading.value = true;
        const response = await AdministrationService.monitorServices(id, params);
        servicesStore.resetServices;
        servicesStore.setServices(response.data.data.services);
        tablesStore.resetTable(tableId);
        const tableData = {
          pagination: response.data.metadata.services.pagination,
          sort: response.data.metadata.services.sort,
          search: response.data.metadata.services.search,
        };
        tablesStore.setTable(tableId, tableData);
        message.value =
          response?.data?.message || response?.statusText || 'Error in servicesGetter';
        success.value = response?.data?.success || false;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        console.error(err);
        message.value = err.response?.data?.message || err.response.statusText;
        success.value = err.response?.data?.success || false;
        code.value = err.response?.data?.code || 'EXXX';
      } finally {
        loading.value = false;
      }
    },
  };

  return { services, actions, loading, success, message, code };
};
