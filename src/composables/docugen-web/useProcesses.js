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
  let listId = 0;
  const listStore = useListsStore();
  const processes = computed(() => processesStore.getProcesses);
  const processingProcesses = computed(() => processesStore.getProcessingProcesses);
  const editionProcesses = computed(() => processesStore.getEditionProcesses);
  // Request settings
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    processesGetter: async (params) => {
      try {
        loading.value = true;
        const { type, ...query } = params;
        const response = await ManagementService.getProcesses({ query });
        switch (type) {
          case 'A':
            processesStore.addProcesses(response.data.data.processes);
            listId = 6;
            break;
          case 'B':
            processesStore.addProcessingProcesses(response.data.data.processes);
            listId = 7;
            break;
          case 'C':
            processesStore.addEditionProcesses(response.data.data.processes);
            listId = 8;
            break;
          default:
            processesStore.addProcesses(response.data.data.processes);
            listId = 6;
        }
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

  return {
    processes,
    processingProcesses,
    editionProcesses,
    actions,
    loading,
    success,
    message,
    code,
  };
};
