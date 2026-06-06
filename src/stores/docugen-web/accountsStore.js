// This store stores the accounts FETCHED from the database
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { deepMerge } from '../../helpers/utils';
import { toRaw } from 'vue';

export const useAccountsStore = defineStore('accounts', () => {
  // States
  const accounts = ref([]);

  //Getters
  const getAccounts = computed(() => accounts.value);
  const getAccount = (id) => {
    const index = accounts.value.findIndex((a) => a._id === id);
    if (index !== -1) {
      return accounts.value[index];
    } else {
      return {};
    }
  };
  // Actions
  const setAccounts = (data) => {
    accounts.value = data || [];
  };
  const setAccount = (id, options) => {
    const index = accounts.value.findIndex((a) => a._id === id);
    if (index !== -1) {
      accounts.value[index] = deepMerge(toRaw(accounts.value[index]), options);
    } else {
      accounts.value.push(options);
      console.log('Se insertó un nuevo documento en el accountStore!!!');
    }
  };
  const resetAccounts = () => {
    accounts.value = [];
  };

  return {
    //Getters
    getAccounts,
    getAccount,
    //Actions
    setAccounts,
    setAccount,
    resetAccounts,
  };
});
