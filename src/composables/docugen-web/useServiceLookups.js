import { AdministrationService } from '../../services/docugen-web/AdministrationService.js';
import { ref, computed } from 'vue';
import { useServiceLookupsStore } from '../../stores/docugen-web/serviceLookupsStore.js';
import { useTablesStore } from '../../stores/utils/tablesStore.js';

export const useServiceLookups = () => {
  // Notification setttings
  const message = ref(null);
  const code = ref(null);
  // Default settings
  const serviceLookupsStore = useServiceLookupsStore();
  const tablesStore = useTablesStore();
  const tableId = 3; // Services
  //  Request settings
  const serviceLookups = computed(() => serviceLookupsStore.getServiceLookups);
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    serviceLookupsGetter: async () => {
      try {
        loading.value = true;
        const response = await AdministrationService.monitorServiceLookups();
        serviceLookupsStore.resetServiceLookups;
        serviceLookupsStore.setServiceLookups(response.data.data.serviceLookups);
        tablesStore.resetTable(tableId);
        const tableData = {
          pagination: response.data.metadata.serviceLookups.pagination,
          sort: response.data.metadata.serviceLookups.sort,
          search: response.data.metadata.serviceLookups.search,
        };
        tablesStore.setTable(tableId, tableData);
        message.value = response?.data?.message || response.statusText;
        success.value = response?.data?.success || false;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        console.error(err);
        message.value =
          err.response?.data?.message || err.response.statusText || 'Error in serviceLookupsGetter';
        success.value = err.response?.data?.success || false;
        code.value = err.response?.data?.code || 'EXXX';
      } finally {
        loading.value = false;
      }
    },
    serviceLookupsOverviewer: async () => {
      try {
        loading.value = true;
        const response = await AdministrationService.overviewServiceLookups();
        serviceLookupsStore.resetServiceLookupsOverview;
        serviceLookupsStore.setServiceLookupsOverview(response.data.data.serviceLookupsOverview);
        message.value =
          response?.data?.message || response.statusText || 'Error in serviceLookupsOverviewer';
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
  return { serviceLookups, actions, loading, success, message, code };
};
