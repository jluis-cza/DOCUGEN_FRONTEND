import { computed, ref } from 'vue';
import { UtilsService } from '../../services/UtilsService.js';
import { useProcessesStore } from '../../stores/utils/processesStore.js';

export const useProcesses = () => {
  // Notification setttings
  const message = ref(null);
  const code = ref(null);
  // Store settings
  const processesStore = useProcessesStore();
  const processes = computed(() => processesStore.getProcesses);
  // Request settings
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    processesGetter: async (params) => {
      try {
        loading.value = true;
        const response = await UtilsService.getProcesses(params);
        processesStore.resetProcesses;
        processesStore.setProcesses(response.data.data.processes);
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
