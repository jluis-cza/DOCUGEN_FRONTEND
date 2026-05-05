import { ref, computed } from 'vue';
import { AdministrationService } from '../../services/docugen-web/AdministrationService.js';
import { useTablesStore } from '../../stores/tablesStore.js';
import { useAccountsStore } from '../../stores/docugen-web/accountsStore.js';

export const useAccounts = () => {
  // Notification setttings
  const message = ref(null);
  const code = ref(null);
  // Default settings
  const accountsStore = useAccountsStore();
  const tablesStore = useTablesStore();
  const tableId = 2; //  Accounts table id
  //  Request settings
  const accounts = computed(() => accountsStore.getAccounts);
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    accountsGetter: async (params) => {
      try {
        loading.value = true;
        const response = await AdministrationService.monitorAccounts(params);
        accountsStore.resetAccounts;
        accountsStore.setAccounts(response.data.data.accounts);
        tablesStore.resetTable(tableId);
        const tableData = {
          pagination: response.data.metadata.accounts.pagination,
          sort: response.data.metadata.accounts.sort,
          search: response.data.metadata.accounts.search,
        };
        tablesStore.setTable(tableId, tableData);
        message.value = response?.data?.message || response.statusText;
        success.value = response?.data?.success || false;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        console.error(err);
        message.value = err.response?.data?.message || err.response.statusText;
        success.value = err.response?.data?.success || false;
        code.value = err.response?.data?.code || 'EXXX';
      } finally {
        loading.value = false;
      }
    },
  };

  return { accounts, actions, loading, success, message, code };
};
