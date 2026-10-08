import { computed, ref } from 'vue';
import { ManagementService } from '../../services/docugen-web/ManagementService.js';
import { useMyProcessesStore } from '../../stores/docugen-web/myProcessesStore.js';

export const useMyProcesses = () => {
  // Notification setttings
  const message = ref(null);
  const code = ref(null);
  // Store settings
  const myProcessesStore = useMyProcessesStore();
  const myProcesses = computed(() => myProcessesStore.getAllMyProcesses);
  const timelineProcesses = computed(() => myProcessesStore.getAllTimelineProcesses);
  // Request settings
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    myProcessesGetter: async (params) => {
      try {
        loading.value = true;
        const response = await ManagementService.getProcesses(params);
        const newProcesses = response.data.data.processes;
        if (params?.limit !== undefined) {
          if (params?.cursor) {
            myProcessesStore.appendTimelineProcesses(newProcesses);
          } else {
            myProcessesStore.setTimelineProcesses(newProcesses);
          }
        } else {
          myProcessesStore.setMyProcesses(newProcesses);
        }
        message.value = response?.data?.message || response.statusText;
        success.value = response?.data?.success || false;
        code.value = response?.data?.code || 'EXXX';
        return response.data.metadata?.processes || {};
      } catch (err) {
        console.error(err);
        success.value = err.response?.data?.success || false;
        message.value =
          err.response?.data?.message || err.response?.statusText || 'Error in myProcessesGetter';
        code.value = err.response?.data?.code || 'EXXX';
        throw err;
      } finally {
        loading.value = false;
      }
    },
  };

  return { myProcesses, timelineProcesses, actions, loading, success, message, code };
};
