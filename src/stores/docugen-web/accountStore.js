import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAccountStore = defineStore('account', () => {
  // States
  const account = ref({});

  //Getters
  const getAccount = computed(() => account.value);

  // Actions
  const setAccount = (data) => {
    account.value = data || {};
    return true;
  };
  const resetAccount = () => {
    account.value = {};
  };

  return {
    //Getters
    getAccount,
    //Actions
    setAccount,
    resetAccount,
    // registerAccount,
  };
});
