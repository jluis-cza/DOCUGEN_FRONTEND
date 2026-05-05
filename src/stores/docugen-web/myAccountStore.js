// This store referes to the CURRENT account loggend in the system
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useMyAccountStore = defineStore('myAccount', () => {
  // States
  const myAccount = ref({});

  //Getters
  const getMyAccount = computed(() => myAccount.value);

  // Actions
  const setMyAccount = (data) => {
    myAccount.value = data || {};
    return true;
  };
  const resetMyAccount = () => {
    myAccount.value = {};
  };

  return {
    //Getters
    getMyAccount,
    //Actions
    setMyAccount,
    resetMyAccount,
    // registerAccount,
  };
});
