import { AdmissionService } from '../../services/docugen-web/AdmissionService.js';
import { ref } from 'vue';

export const useToken = () => {
  const token = ref(null);
  const account = ref(null);
  const session = ref(null);
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    // This verifies the token parameter within the verification email
    verifyToken: async () => {
      try {
        loading.value = true;
        const response = await AdmissionService.verify();
        success.value = response?.data?.success;
      } catch (err) {
        success.value = err.response?.data?.success;
      } finally {
        loading.value = false;
      }
    },
  };

  const bundle = { token, session, account, actions, loading, success };
  return bundle;
};
