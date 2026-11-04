import { axiosInstance } from '../AxiosInstanceService.js';
import { SERVICES } from '@/constants/services.js';

const BASE = SERVICES.path.docugen_app.base;
const TEMPLATES = SERVICES.path.docugen_app.templates.base;
const TEMPLATE_ID = SERVICES.path.docugen_app.templates.id;
const PARAMETERS = SERVICES.path.docugen_app.templates.parameters;
const templatePath = (id) => BASE + TEMPLATES + TEMPLATE_ID.replace(':template_id', id);

export const AcquisitionService = {
  listTemplates: (params) => axiosInstance.get(BASE + TEMPLATES, { params }),
  getTemplate: (id, includeContent = false) =>
    axiosInstance.get(templatePath(id), {
      params: includeContent ? { include: 'content' } : undefined,
    }),
  getTemplateParameters: (id) => axiosInstance.get(templatePath(id) + PARAMETERS),
};
