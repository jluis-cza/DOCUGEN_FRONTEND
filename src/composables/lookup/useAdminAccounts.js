import { computed, ref } from 'vue';
import { LookupService } from '../../services/LookupService.js';
import { useAdminAccountsStore } from '../../stores/lookup/AdminAccountsStore.js';

export const useAdminAccounts = () => {
  // Notification setttings
  const message = ref(null);
  const code = ref(null);
  // Store settings
  const adminAccountsStore = useAdminAccountsStore();
  const adminAccounts = computed(() => adminAccountsStore.getAdminAccounts);
  // Request settings
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    adminAccountsLookup: async () => {
      try {
        loading.value = true;
        const response = await LookupService.getAdminAccounts();
        adminAccountsStore.setAdminAccounts(response.data.data.adminAccounts);
        success.value = response?.data?.success || false;
        message.value = response?.data?.message || response.statusText;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        console.error(err);
        success.value = err.response?.data?.success || false;
        message.value =
          err.response?.data?.message || err.response.statusText || 'Error in adminAccountsLookup';
        code.value = err.response?.data?.code || 'EXXX';
      } finally {
        loading.value = false;
      }
    },
  };

  return { adminAccounts, actions, loading, success, message, code };
};
