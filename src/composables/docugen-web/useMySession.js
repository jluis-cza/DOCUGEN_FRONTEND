import { AdmissionService } from '../../services/docugen-web/AdmissionService.js';
import { ref, computed } from 'vue';
import { useNotificationStore } from '../../stores/notificationStore.js';
import { useMyAccountStore } from '../../stores/docugen-web/myAccountStore.js';
import { useTokenStore } from '../../stores/docugen-web/tokenStore.js';
import { useMySessionStore } from '../../stores/docugen-web/mySessionStore.js';

export const useMySession = () => {
  // Notification settings
  const notificationStore = useNotificationStore();
  const message = ref(null);
  const code = ref(null);
  // Default settings
  const tokenStore = useTokenStore();
  const mySessionStore = useMySessionStore();
  const myAccountStore = useMyAccountStore();
  // Petition settings
  const mySession = computed(() => mySessionStore.getMySession);
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    mySessionStarter: async (payload) => {
      try {
        loading.value = true;
        const response = await AdmissionService.login(payload);
        mySessionStore.setMySession(response.data.data.session);
        myAccountStore.setMyAccount(response.data.data.account);
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
        notificationStore.setNotification(data);
        //         const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        // await sleep(2000); //2 seconds
        // notification.resetNotification();
        loading.value = false;
      }
    },
    mySessionCloser: async (payload) => {
      try {
        loading.value = true;
        const response = await AdmissionService.logout(payload);
        mySessionStore.resetMySession();
        myAccountStore.resetMyAccount();
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
        notificationStore.setNotification(data);
        loading.value = false;
      }
    },
  };

  return { mySession, actions, loading, success, message, code };
};
