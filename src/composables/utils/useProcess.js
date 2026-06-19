import { ref, computed } from 'vue';
import { UtilsService } from '../../services/UtilsService.js';
import { useProcessesStore } from '../../stores/utils/processesStore.js';

export const useProcess = () => {
  // Notification setttings
  const message = ref(null);
  const code = ref(null);
  //  Request settings
  const processesStore = useProcessesStore();
  const processId = ref('');
  const process = computed(() => processesStore.getProcess(processId.value));
  // Petition settings
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    processStore: async (id) => {
      try {
        loading.value = true;
        processId.value = id;
        const response = await UtilsService.getProcess(id);
        processesStore.setProcess(id, response.data.data.process);
        message.value = response?.data?.message || response.statusText;
        success.value = response?.data?.success;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        console.error(err);
        message.value =
          err.response?.data?.message || err.response.statusText || 'Error in processStore';
        success.value = err.response?.data?.success;
        code.value = err.response?.data?.code || 'EXXX';
      } finally {
        loading.value = false;
      }
    },
  };

  return { process, actions, loading, success, message, code };
};
