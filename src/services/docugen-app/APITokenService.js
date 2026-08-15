import { axiosInstance } from '../AxiosInstanceService.js';
import { SERVICES } from '@/constants/services.js';

const BASE = SERVICES.path.docugen_app.base;
const API_TOKENS = SERVICES.path.docugen_app.api_tokens.base;
const API_TOKEN_ID = SERVICES.path.docugen_app.api_tokens.id;
const API_TOKEN_USAGE = SERVICES.path.docugen_app.api_tokens.usage;

export const APITokenService = {
  // List all tokens
  getTokens: (params) => axiosInstance.get(BASE + API_TOKENS, { params }),

  // Create new token
  createToken: (payload) => axiosInstance.post(BASE + API_TOKENS, payload),

  // Get single token
  getToken: (id) => axiosInstance.get(BASE + API_TOKENS + `/${id}`),

  // Update token
  updateToken: (id, payload) => axiosInstance.put(BASE + API_TOKENS + `/${id}`, payload),

  // Revoke token
  revokeToken: (id) => axiosInstance.post(BASE + API_TOKENS + `/${id}/revoke`),

  // Delete token
  deleteToken: (id) => axiosInstance.delete(BASE + API_TOKENS + `/${id}`),

  // Get token usage statistics
  getTokenUsage: (id) => axiosInstance.get(BASE + API_TOKENS + `/${id}` + API_TOKEN_USAGE),
};
