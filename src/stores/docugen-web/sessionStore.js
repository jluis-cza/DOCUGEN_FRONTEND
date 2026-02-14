import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useSessionStore = defineStore('session', () => {
  // States
  const session = ref({});

  //Getters
  const getSession = computed(() => session.value);

  // Actions
  const setSession = (data) => {
    session.value = data || {};
    return session;
  };
  const resetSession = () => {
    session.value = {};
    return session;
  };
  return {
    //Getters
    getSession,
    //Actions
    setSession,
    resetSession,
  };
});
