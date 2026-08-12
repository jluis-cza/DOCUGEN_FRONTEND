import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAdminAccountsStore = defineStore('adminAccounts', () => {
  // States
  const adminAccounts = ref([]);
  // Getters
  const getAdminAccounts = computed(() => adminAccounts.value);
  // Actions
  const setAdminAccounts = (data) => {
    adminAccounts.value = data || [];
  };
  const resetAdminAccounts = () => {
    adminAccounts.value = [];
  };
  return { getAdminAccounts, setAdminAccounts, resetAdminAccounts };
});
