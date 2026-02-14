import { AdmissionService } from '../../services/docugen-web/AdmissionService.js';
import { ref } from 'vue';

export const useToken = () => {
  const token = ref(null);
  const account = ref(null);
  const session = ref(null);
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    renewToken: async () => {
      try {
        loading.value = true;
        const response = await AdmissionService.renew();
        session.value = response.data.data.session;
        account.value = response.data.data.account;
        token.value = response.data.data.token;
        success.value = response?.data?.success || true;
      } catch (err) {
        success.value = err.response?.data?.success || false;
      } finally {
        loading.value = false;
      }
    },
  };

  const bundle = { token, session, account, actions, loading, success };
  return bundle;
};
