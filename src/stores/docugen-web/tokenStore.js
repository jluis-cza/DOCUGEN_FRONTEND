import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useTokenStore = defineStore('token', () => {
  // States
  const token = ref('');

  //Getters
  const getToken = computed(() => (typeof token.value === 'string' ? token.value : ''));

  // Actions
  const setToken = (data) => {
    token.value = typeof data === 'string' ? data : '';
  };
  const resetToken = () => {
    token.value = '';
  };

  return {
    //Getters
    getToken,
    //Actions
    setToken,
    resetToken,
  };
});
