import { computed, ref } from 'vue';
import { ManagementService } from '../../services/docugen-web/ManagementService.js';
import { useProcessesStore } from '../../stores/docugen-web/processesStore.js';
import { useListsStore } from '../../stores/utils/listsStore.js';

export const useProcesses = () => {
  // Notification setttings
  const message = ref(null);
  const code = ref(null);
  // Store settings
  const processesStore = useProcessesStore();
  const listStore = useListsStore();
  const processes = computed(() => processesStore.getProcesses);
  const listId = 4;
  // Request settings
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    processesGetter: async (params) => {
      try {
        loading.value = true;
        const response = await ManagementService.getProcesses(params);
        processesStore.addProcesses(response.data.data.processes);
        listStore.setList(listId, response.data.metadata.processes);
        message.value = response?.data?.message || response.statusText;
        success.value = response?.data?.success || false;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        console.error(err);
        success.value = err.response?.data?.success || false;
        message.value =
          err.response?.data?.message || err.response.statusText || 'Error in processesGetter';
        code.value = err.response?.data?.code || 'EXXX';
      } finally {
        loading.value = false;
      }
    },
  };

  return { processes, actions, loading, success, message, code };
};
