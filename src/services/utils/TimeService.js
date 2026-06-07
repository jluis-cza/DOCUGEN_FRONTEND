// Admission HTTP services using the axios instance

import { axiosInstance } from '../AxiosInstanceService.js';
import { SERVICES } from '@/constants/services.js';

const TIME_UTILS_PATH = SERVICES.path.utils.time;

export const TimeUtilsService = {
  // Getters
  getServerTime: () => {
    return axiosInstance.get(TIME_UTILS_PATH);
  },
};
