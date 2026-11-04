import { axiosInstance } from '../AxiosInstanceService.js';
import { SERVICES } from '@/constants/services.js';

const BASE = SERVICES.path.docugen_app.base;
const DOCUMENTS = SERVICES.path.docugen_app.documents.base;
const GENERATE = SERVICES.path.docugen_app.documents.generate;
const BULK_GENERATE = SERVICES.path.docugen_app.documents.bulk_generate;

export const ProcessingService = {
  generateDocumentRemote: (payload) => axiosInstance.post(BASE + DOCUMENTS + GENERATE, payload),
  generateDocumentsBulk: (payload) => axiosInstance.post(BASE + DOCUMENTS + BULK_GENERATE, payload),
};
