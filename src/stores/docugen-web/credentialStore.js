import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AdmissionService } from '../../services/docugen-web/AdmissionService.js';

export const useCredentialsStore = defineStore('credentials', () => {
  // States
  const credentials = ref({});
  const acceptedCredentials = ref(null);

  //Getters
  const getCredentials = computed(() => credentials.value);
  const areAcceptedCredentials = computed(() => acceptedCredentials.value);

  // Actions
  const setCredentials = (data) => {
    credentials.value = data || {};
  };
  const resetCredentials = () => {
    credentials.value = {};
  };
  async function submitCredentials(data) {
    try {
      const response = await AdmissionService.login(data);
      acceptedCredentials.value = response.data.success;
      // {token, username, role} = response.data.data;
      // if(response.data.success){
      //   window.localStorage.setItem('token', token)
      // }
      return response;
    } catch (error) {
      console.log('Error', error);
      return error;
    }
  }

  return {
    //States
    credentials,
    acceptedCredentials,
    //Getters
    getCredentials,
    areAcceptedCredentials,
    //Actions
    setCredentials,
    resetCredentials,
    submitCredentials,
  };
});
