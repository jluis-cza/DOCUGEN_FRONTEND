import { ref, computed } from 'vue';
import { APITokenService } from '../../services/docugen-app/APITokenService.js';

const unwrapApiData = (response, fallback = {}) => {
  if (response?.data?.data !== undefined) return response.data.data;
  if (response?.data !== undefined) return response.data;
  return fallback;
};

const normalizeCreatedToken = (payload) => {
  if (!payload) return null;
  if (typeof payload === 'string') return { token: payload };
  if (payload.token) return payload;
  if (payload.data) {
    if (typeof payload.data === 'string') return { token: payload.data };
    if (payload.data.token) return payload.data;
    if (payload.data.data) return normalizeCreatedToken(payload.data.data);
  }
  if (payload.value && typeof payload.value === 'string') return { token: payload.value };
  return payload;
};

export const useAPITokens = () => {
  const tokens = ref([]);
  const selectedToken = ref(null);
  const loading = ref(false);
  const success = ref(null);
  const message = ref('');
  const code = ref('');

  const tokensList = computed(() => tokens.value);

  const getTokens = async () => {
    try {
      loading.value = true;
      const response = await APITokenService.getTokens();
      const payload = unwrapApiData(response, { tokens: [] });
      tokens.value = Array.isArray(payload?.tokens) ? payload.tokens : [];
      success.value = response.data?.success ?? true;
      message.value = response.data?.message || '';
      code.value = response.data?.code || 'S3002';
      return response.data;
    } catch (error) {
      success.value = false;
      message.value = error.response?.data?.message || 'Error listando tokens';
      code.value = error.response?.data?.code || 'EXXX';
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const createToken = async (payload) => {
    try {
      loading.value = true;
      const response = await APITokenService.createToken(payload);
      success.value = response.data?.success ?? true;
      message.value = response.data?.message || '';
      code.value = response.data?.code || 'S3001';

      // Actualizar lista
      await getTokens();

      // Retornar el token generado (solo esta vez) de forma robusta
      return normalizeCreatedToken(response);
    } catch (error) {
      success.value = false;
      message.value = error.response?.data?.message || 'Error creando token';
      code.value = error.response?.data?.code || 'EXXX';
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const getToken = async (id) => {
    try {
      loading.value = true;
      const response = await APITokenService.getToken(id);
      const token = unwrapApiData(response, {});
      selectedToken.value = token;
      success.value = response.data?.success ?? true;
      message.value = response.data?.message || '';
      code.value = response.data?.code || 'S3003';
      return token;
    } catch (error) {
      success.value = false;
      message.value = error.response?.data?.message || 'Error obteniendo token';
      code.value = error.response?.data?.code || 'EXXX';
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updateToken = async (id, payload) => {
    try {
      loading.value = true;
      const response = await APITokenService.updateToken(id, payload);
      const token = unwrapApiData(response, {});
      success.value = response.data?.success ?? true;
      message.value = response.data?.message || '';
      code.value = response.data?.code || 'S3004';

      // Actualizar lista
      await getTokens();

      return token;
    } catch (error) {
      success.value = false;
      message.value = error.response?.data?.message || 'Error actualizando token';
      code.value = error.response?.data?.code || 'EXXX';
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const revokeToken = async (id) => {
    try {
      loading.value = true;
      const response = await APITokenService.revokeToken(id);
      success.value = response.data?.success ?? true;
      message.value = response.data?.message || '';
      code.value = response.data?.code || 'S3005';

      // Actualizar lista
      await getTokens();

      return response.data.data;
    } catch (error) {
      success.value = false;
      message.value = error.response?.data?.message || 'Error revocando token';
      code.value = error.response?.data?.code || 'EXXX';
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const deleteToken = async (id) => {
    try {
      loading.value = true;
      const response = await APITokenService.deleteToken(id);
      success.value = response.data?.success ?? true;
      message.value = response.data?.message || '';
      code.value = response.data?.code || 'S3006';

      // Actualizar lista
      await getTokens();

      return response.data.data;
    } catch (error) {
      success.value = false;
      message.value = error.response?.data?.message || 'Error eliminando token';
      code.value = error.response?.data?.code || 'EXXX';
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const getTokenUsage = async (id) => {
    try {
      loading.value = true;
      const response = await APITokenService.getTokenUsage(id);
      const usage = unwrapApiData(response, {});
      success.value = response.data?.success ?? true;
      message.value = response.data?.message || '';
      code.value = response.data?.code || 'S3007';
      return usage;
    } catch (error) {
      success.value = false;
      message.value = error.response?.data?.message || 'Error obteniendo estadísticas';
      code.value = error.response?.data?.code || 'EXXX';
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    tokens: tokensList,
    selectedToken,
    loading,
    success,
    message,
    code,
    getTokens,
    createToken,
    getToken,
    updateToken,
    revokeToken,
    deleteToken,
    getTokenUsage,
  };
};
