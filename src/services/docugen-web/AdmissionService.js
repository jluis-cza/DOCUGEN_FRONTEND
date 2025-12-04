// Admission HTTP services using the axios instance

import axiosInstance from '../AxiosInstanceService.js';
import { SERVICES } from '@/constants/services.js';

const ADMISSION_BASE_PATH = SERVICES.path.docugen_web.admission.base;
const REGISTER_ACCOUNT_PATH = SERVICES.path.docugen_web.admission.register_account;
const START_SESSION_PATH = SERVICES.path.docugen_web.admission.start_session;
const CLOSE_SESSION_PATH = SERVICES.path.docugen_web.admission.close_session;

export const AdmissionService = {
  registerAccount: (payload) => {
    return axiosInstance.post(ADMISSION_BASE_PATH + REGISTER_ACCOUNT_PATH, payload);
  },
  login: (payload) => {
    return axiosInstance.post(ADMISSION_BASE_PATH + START_SESSION_PATH, payload);
  },
  logout: (payload) => {
    return axiosInstance.post(ADMISSION_BASE_PATH + CLOSE_SESSION_PATH, payload);
  },
};
