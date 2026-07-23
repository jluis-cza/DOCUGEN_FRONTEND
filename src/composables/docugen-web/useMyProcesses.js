import { computed, ref } from 'vue';
import { ManagementService } from '../../services/docugen-web/ManagementService.js';
import { useMyProcessesStore } from '../../stores/docugen-web/myProcessesStore.js';

export const useMyProcesses = () => {
  // Notification setttings
  const message = ref(null);
  const code = ref(null);
  // Store settings
  const myProcessesStore = useMyProcessesStore();
  const myProcesses = computed(() => myProcessesStore.getMyProcesses);
  // Request settings
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    myProcessesGetter: async (params) => {
      try {
        loading.value = true;
        const response = await ManagementService.getProcesses(params);
        myProcessesStore.resetProcesses;
        myProcessesStore.setMyProcesses(response.data.data.processes);
        message.value = response?.data?.message || response.statusText;
        success.value = response?.data?.success || false;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        console.error(err);
        success.value = err.response?.data?.success || false;
        message.value =
          err.response?.data?.message || err.response.statusText || 'Error in myProcessesGetter';
        code.value = err.response?.data?.code || 'EXXX';
      } finally {
        loading.value = false;
      }
    },
  };

  return { myProcesses, actions, loading, success, message, code };
};
