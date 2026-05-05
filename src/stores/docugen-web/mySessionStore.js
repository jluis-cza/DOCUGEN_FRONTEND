import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useMySessionStore = defineStore('mySession', () => {
  // States
  const mySession = ref({});

  //Getters
  const getMySession = computed(() => mySession.value);

  // Actions
  const setMySession = (data) => {
    mySession.value = data || {};
    // return session;
  };
  const resetMySession = () => {
    mySession.value = {};
    // return session;
  };
  return {
    //Getters
    getMySession,
    //Actions
    setMySession,
    resetMySession,
  };
});
