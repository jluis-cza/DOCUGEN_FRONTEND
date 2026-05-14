import { ref } from 'vue';
import { AdmissionService } from '../../services/docugen-web/AdmissionService.js';

export const useEmail = () => {
  // Notification setttings
  const message = ref(null);
  const code = ref(null);
  // Request settings
  const email = ref(null);
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    // This verifies the token parameter within the verification email
    emailVerifier: async (payload) => {
      try {
        loading.value = true;
        const response = await AdmissionService.verifyEmail(payload);
        email.value = response.data.data.email;
        success.value = response?.data?.success || false;
        message.value = response?.data?.message || response.statusText;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        console.error(err);
        success.value = err.response?.data?.success || false;
        message.value =
          err.response?.data?.message || err.response.statusText || 'Error in emailVerifier';
        code.value = err.response?.data?.code || 'EXXX';
      } finally {
        loading.value = false;
      }
    },
  };

  return { email, actions, loading, success, message, code };
};
