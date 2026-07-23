// Admission HTTP services using the axios instance

import { axiosInstance } from '../AxiosInstanceService.js';
import { SERVICES } from '@/constants/services.js';

const ADMISSION_BASE_PATH = SERVICES.path.docugen_web.admission.base;
const REGISTER_ACCOUNT_PATH = SERVICES.path.docugen_web.admission.register_account;
const START_SESSION_PATH = SERVICES.path.docugen_web.admission.start_session;
const CLOSE_SESSION_PATH = SERVICES.path.docugen_web.admission.close_session;
const RENEW_ACCESS_PATH = SERVICES.path.docugen_web.admission.renew_access;
const VERIFY_EMAIL_PATH = SERVICES.path.docugen_web.admission.verify_email;
const VERIFY_PASSWORD_PATH = SERVICES.path.docugen_web.admission.verify_password;
const CHECK_USERNAME_PATH = SERVICES.path.docugen_web.admission.check_username;
const GET_USERNAME_PATH = SERVICES.path.docugen_web.admission.get_username;

export const AdmissionService = {
  registerMyAccount: (payload) => {
    return axiosInstance.post(ADMISSION_BASE_PATH + REGISTER_ACCOUNT_PATH, payload);
  },
  login: (payload) => {
    return axiosInstance.post(ADMISSION_BASE_PATH + START_SESSION_PATH, payload);
  },
  logout: (payload) => {
    return axiosInstance.post(ADMISSION_BASE_PATH + CLOSE_SESSION_PATH, payload);
  },
  renewAccess: () => {
    return axiosInstance.post(ADMISSION_BASE_PATH + RENEW_ACCESS_PATH);
  },
  verifyEmail: (payload) => {
    return axiosInstance.post(ADMISSION_BASE_PATH + VERIFY_EMAIL_PATH, payload);
  },
  verifyPassword: (payload) => {
    return axiosInstance.post(ADMISSION_BASE_PATH + VERIFY_PASSWORD_PATH, payload);
  },
  checkUsername: (payload) => {
    return axiosInstance.post(ADMISSION_BASE_PATH + CHECK_USERNAME_PATH, payload);
  },
  getUsername: (params) => {
    return axiosInstance.get(ADMISSION_BASE_PATH + GET_USERNAME_PATH, {params} );
  },
};
