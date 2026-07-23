import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useMyUsernameStore = defineStore('myUsername', () => {
  // States
  const myUsername = ref('');

  //Getters
  const getMyUsername = computed(() => myUsername.value);
  
  // Actions
  const setMyUsername = (data) => {
    myUsername.value = data || '';
    return true;
  };
  const resetMyUsername = () => {
    myUsername.value = '';
  };

  return {
    //Getters
    getMyUsername,
    //Actions
    setMyUsername,
    resetMyUsername,
  };
});
