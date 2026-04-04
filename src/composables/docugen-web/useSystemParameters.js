import { AdministrationService } from '../../services/docugen-web/AdministrationService.js';
import { ref, computed } from 'vue';
import { useSystemParametersStore } from '../../stores/docugen-web/systemParametersStore.js';
import { useTablesStore } from '../../stores/tablesStore.js';

const message = ref(null);
const tablesStore = useTablesStore();
const systemParametersStore = useSystemParametersStore();
const tableId = 1; // SystemParameters

export const useSystemParameters = () => {
  const table = computed(() => tablesStore.getTable(tableId));
  const systemParameters = computed(() => systemParametersStore.getSystemParameters);
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    systemParametersGetter: async (params) => {
      try {
        loading.value = true;
        const response = await AdministrationService.monitorSystemParameters(params);
        systemParametersStore.setSystemParameters(response.data.data.systemParameters);
        const payload = {
          pagination: response.data.metadata.systemParameters.pagination,
          sort: { sortBy: params.sortBy, sortOrder: params.sortOrder },
          search: params.search,
        };
        tablesStore.setTable(tableId, payload);
        message.value = response?.data?.message || response.statusText;
        success.value = response?.data?.success;
      } catch (err) {
        console.error(err);
        message.value = err.response?.data?.message || err.response.statusText;
        success.value = err.response?.data?.success;
      } finally {
        loading.value = false;
      }
    },
  };
  return {
    systemParameters,
    table,
    message,
    actions,
    loading,
    success,
  };
};
