import { axiosInstance } from '../AxiosInstanceService.js';
import { SERVICES } from '@/constants/services.js';

const BASE = SERVICES.path.docugen_app.base;
const TEMPLATES = SERVICES.path.docugen_app.templates.base;
const DOCUMENTS = SERVICES.path.docugen_app.documents.base;
const RENDER = SERVICES.path.docugen_app.render;
const PARAMETERS = SERVICES.path.docugen_app.templates.parameters;
const GENERATE = SERVICES.path.docugen_app.documents.generate;
const AVAILABILITY = SERVICES.path.docugen_app.documents.availability;

export const TemplateService = {
  listTemplates: (params) => axiosInstance.get(BASE + TEMPLATES, { params }),
  getTemplate: (id) => axiosInstance.get(BASE + TEMPLATES + `/${id}`),
  getTemplateParameters: (id) => axiosInstance.get(BASE + TEMPLATES + `/${id}` + PARAMETERS),
  getGenerationAvailability: () => axiosInstance.get(BASE + DOCUMENTS + AVAILABILITY),
  createTemplate: (payload) => axiosInstance.post(BASE + TEMPLATES, payload),
  updateTemplate: (id, payload) => axiosInstance.put(BASE + TEMPLATES + `/${id}`, payload),
  deleteTemplate: (id) => axiosInstance.delete(BASE + TEMPLATES + `/${id}`),
  generateDocumentRemote: (payload) => axiosInstance.post(BASE + DOCUMENTS + GENERATE, payload),
  renderTemplate: (payload) => axiosInstance.post(BASE + RENDER, payload),
};
