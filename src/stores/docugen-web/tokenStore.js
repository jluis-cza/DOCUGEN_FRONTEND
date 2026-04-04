import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useTokenStore = defineStore('token', () => {
  // States
  const token = ref(null);

  //Getters
  const getToken = computed(() => token.value);

  // Actions
  const setToken = (data) => {
    token.value = data || '';
  };
  const resetToken = () => {
    token.value = {};
  };

  return {
    //Getters
    getToken,
    //Actions
    setToken,
    resetToken,
  };
});
