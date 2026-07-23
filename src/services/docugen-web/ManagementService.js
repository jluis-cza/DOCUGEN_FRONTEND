// Admission HTTP services using the axios instance

import { axiosInstance } from '../AxiosInstanceService.js';
import { SERVICES } from '../../constants/services.js';

const MANAGEMENT_BASE_PATH = SERVICES.path.docugen_web.management.base;
const CONFIGURATION_PATH = SERVICES.path.docugen_web.management.configuration;
const MONITOR_PATH = SERVICES.path.docugen_web.management.monitor;
const PROCESSES_PATH = SERVICES.path.docugen_web.management.resource.processes.base;
const NOTIFICATIONS_PATH = SERVICES.path.docugen_web.management.resource.notifications.base;
const PROFILES_PATH = SERVICES.path.docugen_web.management.resource.profiles.base;

export const ManagementService = {
  // Getters
  getProcesses: (params) => {
    return axiosInstance.get(MANAGEMENT_BASE_PATH + MONITOR_PATH + PROCESSES_PATH, { params });
  },
  getNotifications: (params) => {
    return axiosInstance.get(MANAGEMENT_BASE_PATH + MONITOR_PATH + NOTIFICATIONS_PATH, { params });
  },
  getProfile: (id) => {
    return axiosInstance.get(MANAGEMENT_BASE_PATH + MONITOR_PATH + PROFILES_PATH + `/${id}`);
  },
  // Setters
  setNotification: (id, params) => {
    return axiosInstance.post(
      MANAGEMENT_BASE_PATH + CONFIGURATION_PATH + NOTIFICATIONS_PATH + `/${id}`,
      params
    );
  },
  setProfile: (id, payload) => {
    return axiosInstance.post(
      MANAGEMENT_BASE_PATH + CONFIGURATION_PATH + PROFILES_PATH + `/${id}`,
      payload
    );
  },
};
