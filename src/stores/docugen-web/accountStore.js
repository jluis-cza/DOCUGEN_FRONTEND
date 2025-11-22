import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AdmissionService } from '@/services/docugen-web/AdmissionService';

export const useAccountStore = defineStore('account', () => {
  // States
  const account = ref({});
  const registeredAccount = ref(null);

  //Getters
  const getAccount = computed(() => account.value);
  const isRegisteredAccount = computed(() => registeredAccount.value);

  // Actions
  const setAccount = (data) => {
    account.value = data || {};
    return account;
  };
  const resetAccount = () => {
    account.value = {};
    return account;
  };
  async function registerAccount(data) {
    try {
      const response = await AdmissionService.registerAccount(data);
      registeredAccount.value = response ? true : false;
      return response;
    } catch (error) {
      console.log('Error', error);
      registeredAccount.value = false;
      return error;
    }
  }

  return {
    //States
    account,
    //Getters
    getAccount,
    isRegisteredAccount,
    //Actions
    setAccount,
    resetAccount,
    registerAccount,
  };
});
