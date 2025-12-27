import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AdmissionService } from '@/services/docugen-web/AdmissionService.js';

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

  // open session and others TO-DO

  async function closeSession(data) {
    try {
      const response = await AdmissionService.logout(data);
      if(!response.data.success){
        console.error('It hasn´t been possible to close the current session.')
      } 
      resetSession()
    } catch (error) {
      console.log('Error', error);
      return error;
    }
  }

  return {
    //States
    session,
    //Getters
    getSession,
    //Actions
    setSession,
    resetSession,
    closeSession,
  };
});
