import { axiosInstance } from '../AxiosInstanceService.js';
import { SERVICES } from '@/constants/services.js';

const BASE = SERVICES.path.docugen_app.base;
const RENDER = SERVICES.path.docugen_app.render;

export const PresentationService = {
  renderTemplate: (payload) => axiosInstance.post(BASE + RENDER, payload),
};
