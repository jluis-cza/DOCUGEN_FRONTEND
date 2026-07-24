import { ref } from 'vue';
import { AdmissionService } from '../../services/docugen-web/AdmissionService.js';

export const useUsername = () => {
  // Notification setttings
  const message = ref(null);
  const code = ref(null);
  // Request settings
  const username = ref(null);
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    // Checks the availability of a username string
    usernameChecker: async (payload) => {
      try {
        loading.value = true;
        const response = await AdmissionService.checkUsername(payload);
        username.value = response.data;
        success.value = response?.data?.success || false;
        message.value = response?.data?.message || response.statusText;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        console.error(err);
        success.value = err.response?.data?.success || false;
        message.value =
          err.response?.data?.message || err.response.statusText || 'Error in usernameChecker';
        code.value = err.response?.data?.code || 'EXXX';
      } finally {
        loading.value = false;
      }
    },
  };

  return { username, actions, loading, success, message, code };
};
