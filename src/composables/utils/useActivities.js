import { computed, ref } from 'vue';
import { UtilsService } from '../../services/UtilsService.js';
import { useActivitiesStore } from '../../stores/utils/activitiesStore.js';

export const useActivities = () => {
  // Notification setttings
  const message = ref(null);
  const code = ref(null);
  // Store settings
  const activitiesStore = useActivitiesStore();
  const activities = computed(() => activitiesStore.getAllActivities);
  // Request settings
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    activitiesGetter: async (params) => {
      try {
        loading.value = true;
        const response = await UtilsService.getActivities(params);
        activitiesStore.resetActivities;
        activitiesStore.setActivities(response.data.data.activities);
        message.value = response?.data?.message || response.statusText;
        success.value = response?.data?.success || false;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        console.error(err);
        success.value = err.response?.data?.success || false;
        message.value =
          err.response?.data?.message || err.response.statusText || 'Error in activitiesGetter';
        code.value = err.response?.data?.code || 'EXXX';
      } finally {
        loading.value = false;
      }
    },
  };

  return { activities, actions, loading, success, message, code };
};
