import { computed, ref } from 'vue';
import { TimeUtilsService } from '../../services/utils/TimeService.js';
import { useTimeStore } from '../../stores/utils/timeStore.js';

export const useTime = () => {
  // Notification setttings
  const message = ref(null);
  const code = ref(null);
  // Store settings
  const timeStore = useTimeStore();
  const time = computed(() => timeStore.getTime);
  // Request settings
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    getTime: async () => {
      try {
        loading.value = true;
        const response = await TimeUtilsService.getServerTime();
        timeStore.setTime(response.data.data.time);
        success.value = response?.data?.success || false;
        message.value = response?.data?.message || response.statusText;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        console.error(err);
        success.value = err.response?.data?.success || false;
        message.value =
          err.response?.data?.message || err.response.statusText || 'Error in getTime';
        code.value = err.response?.data?.code || 'EXXX';
      } finally {
        loading.value = false;
      }
    },
  };

  return { time, actions, loading, success, message, code };
};
