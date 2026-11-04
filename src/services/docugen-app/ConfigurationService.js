import { axiosInstance } from '../AxiosInstanceService.js';
import { SERVICES } from '@/constants/services.js';

const BASE = SERVICES.path.docugen_app.base;
const DOCUMENTS = SERVICES.path.docugen_app.documents.base;
const AVAILABILITY = SERVICES.path.docugen_app.documents.availability;
const API_TOKENS = SERVICES.path.docugen_app.api_tokens.base;
const API_TOKEN_ID = SERVICES.path.docugen_app.api_tokens.id;
const API_TOKEN_USAGE = SERVICES.path.docugen_app.api_tokens.usage;
const tokenPath = (id) => BASE + API_TOKENS + API_TOKEN_ID.replace(':token_id', id);

export const ConfigurationService = {
  getGenerationAvailability: () => axiosInstance.get(BASE + DOCUMENTS + AVAILABILITY),
  getAccountServicesAvailability: () => axiosInstance.get(BASE + DOCUMENTS + AVAILABILITY),
  getTokens: (params) => axiosInstance.get(BASE + API_TOKENS, { params }),
  createToken: (payload) => axiosInstance.post(BASE + API_TOKENS, payload),
  getToken: (id) => axiosInstance.get(tokenPath(id)),
  updateToken: (id, payload) => axiosInstance.put(tokenPath(id), payload),
  revokeToken: (id) => axiosInstance.post(tokenPath(id) + '/revoke'),
  deleteToken: (id) => axiosInstance.delete(tokenPath(id)),
  getTokenUsage: (id) => axiosInstance.get(tokenPath(id) + API_TOKEN_USAGE),
};
