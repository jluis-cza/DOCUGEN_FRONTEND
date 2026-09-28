import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const TOKEN_STORAGE_KEY = 'docugen_token';

const getStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  } catch (error) {
    return '';
  }
};

export const useTokenStore = defineStore('token', () => {
  const token = ref(getStoredToken());

  const getToken = computed(() => (typeof token.value === 'string' ? token.value : ''));

  const setToken = (data) => {
    const nextToken = typeof data === 'string' ? data : '';
    token.value = nextToken;
    if (typeof window !== 'undefined') {
      if (nextToken) localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
      else localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  };

  const resetToken = () => {
    token.value = '';
    if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_STORAGE_KEY);
  };

  return {
    getToken,
    setToken,
    resetToken,
  };
});
