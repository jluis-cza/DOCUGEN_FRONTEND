import { AdmissionService } from '../../services/docugen-web/AdmissionService.js';
import { ref } from 'vue';
import { useNotificationStore } from '../../stores/notificationStore.js';

const notification = useNotificationStore();
const message = ref(null);
const code = ref(null);

export const useSession = () => {
  const session = ref(null);
  const account = ref(null);
  const token = ref(null);
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    sessionStarter: async (payload) => {
      try {
        loading.value = true;
        const response = await AdmissionService.login(payload);
        session.value = response.data.data.session;
        account.value = response.data.data.account;
        token.value = response.data.data.token;
        message.value = response?.data?.message || response.statusText;
        success.value = response?.data?.success || true;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        message.value = err.response?.data?.message || err.response.statusText;
        success.value = err.response?.data?.success || false;
        code.value = err.response?.data?.code || 'EXXX';
      } finally {
        const data = {
          message: message.value,
          code: code.value,
        };
        notification.setNotification(data);
        loading.value = false;
      }
    },
    sessionCloser: async (payload) => {
      try {
        loading.value = true;
        const response = await AdmissionService.logout(payload);
        message.value = response?.data?.message || response.statusText;
        success.value = response?.data?.success || true;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        message.value = err.response?.data?.message || err.response.statusText;
        success.value = err.response?.data?.success || false;
        code.value = err.response?.data?.code || 'EXXX';
      } finally {
        const data = {
          message: message.value,
          code: code.value,
        };
        notification.setNotification(data);
        loading.value = false;
      }
    },
  };

  const bundle = { session, account, token, actions, loading, success };
  return bundle;
};
