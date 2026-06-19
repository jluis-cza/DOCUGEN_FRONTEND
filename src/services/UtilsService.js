// Admission HTTP services using the axios instance

import { axiosInstance } from './AxiosInstanceService.js';
import { SERVICES } from '@/constants/services.js';

const TIME_UTILS_PATH = SERVICES.path.utils.time;
const UTILS_PATH = SERVICES.path.utils.base;
const ACTIVITIES_PATH = SERVICES.path.utils.activities.base;
const PROCESSES_PATH = SERVICES.path.utils.processes.base;

export const UtilsService = {
  // Getters
  getServerTime: () => {
    return axiosInstance.get(UTILS_PATH + TIME_UTILS_PATH);
  },
  getActivities: (params) => {
    return axiosInstance.get(UTILS_PATH + ACTIVITIES_PATH, { params });
  },
  getProcesses: (params) => {
    return axiosInstance.get(UTILS_PATH + PROCESSES_PATH, { params });
  },
  getProcess: (id) => {
    return axiosInstance.get(UTILS_PATH + PROCESSES_PATH + `/${id}`);
  },
};
