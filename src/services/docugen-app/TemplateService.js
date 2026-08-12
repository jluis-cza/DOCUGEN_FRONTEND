import { axiosInstance } from '../AxiosInstanceService.js';
import { SERVICES } from '@/constants/services.js';

const BASE = SERVICES.path.docugen_app.base;
const TEMPLATES = SERVICES.path.docugen_app.templates.base;
const RENDER = SERVICES.path.docugen_app.render;

export const TemplateService = {
  listTemplates: (params) => axiosInstance.get(BASE + TEMPLATES, { params }),
  getTemplate: (id) => axiosInstance.get(BASE + TEMPLATES + `/${id}`),
  createTemplate: (payload) => axiosInstance.post(BASE + TEMPLATES, payload),
  updateTemplate: (id, payload) => axiosInstance.put(BASE + TEMPLATES + `/${id}`, payload),
  deleteTemplate: (id) => axiosInstance.delete(BASE + TEMPLATES + `/${id}`),
  renderTemplate: (payload) => axiosInstance.post(BASE + RENDER, payload),
};
