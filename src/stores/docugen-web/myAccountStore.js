// This store referes to the CURRENT account loggend in the system
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const ACCOUNT_STORAGE_KEY = 'docugen_account';

const getStoredAccount = () => {
  try {
    const item = localStorage.getItem(ACCOUNT_STORAGE_KEY);
    return item ? JSON.parse(item) : {};
  } catch (error) {
    return {};
  }
};

export const useMyAccountStore = defineStore('myAccount', () => {
  const myAccount = ref(getStoredAccount());

  const getMyAccount = computed(() => myAccount.value);

  const setMyAccount = (data) => {
    const nextAccount = data || {};
    myAccount.value = nextAccount;
    if (typeof window !== 'undefined') {
      if (Object.keys(nextAccount).length > 0) localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(nextAccount));
      else localStorage.removeItem(ACCOUNT_STORAGE_KEY);
    }
    return true;
  };

  const resetMyAccount = () => {
    myAccount.value = {};
    if (typeof window !== 'undefined') localStorage.removeItem(ACCOUNT_STORAGE_KEY);
  };

  return {
    getMyAccount,
    setMyAccount,
    resetMyAccount,
  };
});
