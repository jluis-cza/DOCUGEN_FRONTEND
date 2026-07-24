import { ref } from 'vue';
import { AdmissionService } from '../../services/docugen-web/AdmissionService.js';

export const useMyPassword = () => {
  // Notification setttings
  const message = ref(null);
  const code = ref(null);
  // Request settings
  const myPassword = ref(null);
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    passwordVerifier: async (payload) => {
      try {
        loading.value = true;
        const response = await AdmissionService.verifyPassword(payload);
        myPassword.value = response.data;
        success.value = response?.data?.success || false;
        message.value = response?.data?.message || response.statusText;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        console.error(err);
        success.value = err.response?.data?.success || false;
        message.value =
          err.response?.data?.message || err.response.statusText || 'Error in passwordVerifier';
        code.value = err.response?.data?.code || 'EXXX';
      } finally {
        loading.value = false;
      }
    },
  };

  return { myPassword, actions, loading, success, message, code };
};
