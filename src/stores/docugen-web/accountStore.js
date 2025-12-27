import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AdmissionService } from '@/services/docugen-web/AdmissionService.js';

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
    resetAccount()
    registeredAccount.value = null;
    try {
      const response = await AdmissionService.registerAccount(data);
      if(response.data.success){
        registeredAccount.value = true;
        setAccount(response.data.data)
      }
    } catch (error) {
      console.log('Error', error);
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
