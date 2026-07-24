import { ref, computed } from 'vue';
import { AdmissionService } from '../../services/docugen-web/AdmissionService.js';
import { useMyUsernameStore } from '../../stores/docugen-web/myUsernameStore.js';

export const useMyUsername = () => {
  // Notification setttings
  const message = ref(null);
  const code = ref(null);
  // Request settings
  const myUsernameStore = useMyUsernameStore();
  const myUsername = computed(() => myUsernameStore.getMyUsername);
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    usernameGetter: async (payload) => {
      try {
        loading.value = true;
        const response = await AdmissionService.getUsername(payload);
        myUsernameStore.resetMyUsername();
        myUsernameStore.setMyUsername(response.data.data.username);
        success.value = response?.data?.success || false;
        message.value = response?.data?.message || response.statusText;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        console.error(err);
        success.value = err.response?.data?.success || false;
        message.value =
          err.response?.data?.message || err.response.statusText || 'Error in usernameGetter';
        code.value = err.response?.data?.code || 'EXXX';
      } finally {
        loading.value = false;
      }
    },
  };

  return { myUsername, actions, loading, success, message, code };
};
