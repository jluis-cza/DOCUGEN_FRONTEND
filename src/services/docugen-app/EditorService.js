import { axiosInstance } from '../AxiosInstanceService.js';
import { SERVICES } from '@/constants/services.js';

const BASE = SERVICES.path.docugen_app.base;
const TEMPLATES = SERVICES.path.docugen_app.templates.base;
const TEMPLATE_ID = SERVICES.path.docugen_app.templates.id;
const templatePath = (id) => BASE + TEMPLATES + TEMPLATE_ID.replace(':template_id', id);

export const EditorService = {
  createTemplate: (payload) => axiosInstance.post(BASE + TEMPLATES, payload),
  updateTemplate: (id, payload) => axiosInstance.put(templatePath(id), payload),
  deleteTemplate: (id) => axiosInstance.delete(templatePath(id)),
};
