// utils HTTP services using the axios instance

import { axiosInstance } from './AxiosInstanceService.js';
import { SERVICES } from '@/constants/services.js';

const TIME_UTILS_PATH = SERVICES.path.utils.time;
const UTILS_PATH = SERVICES.path.utils.base;
const ROUTES_INFO_PATH = SERVICES.path.utils.routes;

export const UtilsService = {
  // Getters
  getRoutesInfo: () => {
    return axiosInstance.get(UTILS_PATH + ROUTES_INFO_PATH);
  },
  getServerTime: () => {
    return axiosInstance.get(UTILS_PATH + TIME_UTILS_PATH);
  },
};
