// Admission HTTP services using the axios instance

import axiosInstance from '../AxiosInstanceService';
import { SERVICES } from '@/constants/services';

export const AdmissionService = {
  registerAccount: (payload) => {
    axiosInstance().post(SERVICES.path.docugen_web.admission.register_account, payload);
  },
  login: (payload) => {
    axiosInstance().post(SERVICES.path.docugen_web.admission.start_session, payload);
  },
};
