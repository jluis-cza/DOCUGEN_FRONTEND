import { AdmissionService } from '../../services/docugen-web/AdmissionService.js';
import { ref, computed } from 'vue';
import { useNotificationStore } from '../../stores/notificationStore.js';
import { useAccountStore } from '../../stores/docugen-web/accountStore.js';
import { useTokenStore } from '../../stores/docugen-web/tokenStore.js';
import { useSessionStore } from '../../stores/docugen-web/sessionStore.js';

export const useSession = () => {
  // Notification settings
  const notification = useNotificationStore();
  const message = ref(null);
  const code = ref(null);
  // Default settings
  const tokenStore = useTokenStore();
  const sessionStore = useSessionStore();
  const accountStore = useAccountStore();
  // Petition settings
  const session = computed(() => sessionStore.getSession);
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    sessionStarter: async (payload) => {
      try {
        loading.value = true;
        const response = await AdmissionService.login(payload);
        sessionStore.setSession(response.data.data.session);
        accountStore.setAccount(response.data.data.account);
        tokenStore.setToken(response.data.data.token);
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
          mode: 'automatic',
        };
        notification.setNotification(data);
        //         const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        // await sleep(2000); //2 seconds
        // notification.resetNotification();
        loading.value = false;
      }
    },
    sessionCloser: async (payload) => {
      try {
        loading.value = true;
        const response = await AdmissionService.logout(payload);
        sessionStore.resetSession();
        accountStore.resetAccount();
        tokenStore.resetToken();
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
          mode: 'automatic',
        };
        notification.setNotification(data);
        loading.value = false;
      }
    },
  };

  return { session, actions, loading, success, message, code };
};
