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

  // Actions
  const setAccounts = (data) => {
    accounts.value = data || [];
  };
  const setAccount = (id, options) => {
    const index = accounts.value.findIndex((s) => s._id === id);
    if (index !== -1) {
      accounts.value[index] = deepMerge(toRaw(accounts.value[index]), options);
    } else {
      console.error('It was intented to update a document!!!');
    }
  };
  const resetAccounts = () => {
    accounts.value = [];
  };

  return {
    //Getters
    getAccounts,
    //Actions
    setAccounts,
    setAccount,
    resetAccounts,
  };
});
