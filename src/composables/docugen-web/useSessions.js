import { ref, computed } from 'vue';
import { AdministrationService } from '../../services/docugen-web/AdministrationService.js';
import { useTablesStore } from '../../stores/utils/tablesStore.js';
import { useSessionsStore } from '../../stores/docugen-web/sessionsStore.js';

export const useSessions = () => {
  // Notification setttings
  const message = ref(null);
  const code = ref(null);
  // Default settings
  const sessionsStore = useSessionsStore();
  const tablesStore = useTablesStore();
  const tableId = 4; //  Sessions table id
  //  Request settings
  const sessions = computed(() => sessionsStore.getSessions);
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    sessionsGetter: async (id, params) => {
      try {
        loading.value = true;
        const response = await AdministrationService.monitorSessions(id, params);
        sessionsStore.resetSessions;
        sessionsStore.setSessions(response.data.data.sessions);
        tablesStore.resetTable(tableId);
        const tableData = {
          pagination: response.data.metadata.sessions.pagination,
          sort: response.data.metadata.sessions.sort,
          search: response.data.metadata.sessions.search,
        };
        tablesStore.setTable(tableId, tableData);
        message.value = response?.data?.message || response.statusText || 'Error in sessionsGetter';
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

  return { sessions, actions, loading, success, message, code };
};
