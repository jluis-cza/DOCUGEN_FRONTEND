// ******************************************************************************
// TOKEN STORE
// To store temporaly the access token in order to operate with authentication
// needed - endpoints
// ******************************************************************************
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AdmissionService } from '../../services/docugen-web/AdmissionService.js';
import { useSessionStore } from './sessionStore.js';


export const useTokenStore = defineStore('token', () => {
  // States
  const token = ref(null);
  const info = ref({}); // Account information

  //Getters
  const getToken = computed(() => token.value);
  const getInfo = computed(() => info.value);

  // Actions
  const setToken = (data) => {
    token.value = data || '';
  };
  const resetToken = () => {
    token.value = {};
  };
  const setInfo = (data) => {
    info.value = data || {};
  };
  const resetInfo = () => {
    info.value = {};
  };

  const renewToken = async () => {
    const session = useSessionStore()
    try {
      const response = await AdmissionService.renew();
      if(!response.data.success){
        throw new Error('Operación fallida.');
      }
      
      const newAccessToken = response.data.accessToken;
      const newAccountData = response.data.accountData;
      const newSessionData = response.data.sessionData;

      if (!newAccessToken) {
        throw new Error('No se recibió un access token válido');
      }
      setToken(newAccessToken);
      if (!newAccountData) {
        throw new Error('No se recibieron datos de cuenta válidos.');
      }
      setInfo(newAccountData);
      if (!newSessionData) {
        throw new Error('No se recibieron datos de sesión válidos.');
      }
      session.setSession(newSessionData);
      return response;
    } catch (error) {
      console.error('Error al renovar token:', error.message);
      // Limpiar tokens si falla la renovación
      resetToken();
      resetInfo();
      session.resetSession()
      throw error;
    }
  };
  return {
    //States
    token,
    info,
    //Getters
    getToken,
    getInfo,
    //Actions
    setToken,
    resetToken,
    setInfo,
    resetInfo,
    renewToken,
  };
});
// ******************************************************************************
