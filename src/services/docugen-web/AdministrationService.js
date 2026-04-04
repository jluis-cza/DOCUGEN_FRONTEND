// Admission HTTP services using the axios instance

import { axiosInstance } from '../AxiosInstanceService.js';
import { SERVICES } from '@/constants/services.js';

const ADMINISTRATION_BASE_PATH = SERVICES.path.docugen_web.administration.base;
const MONITOR_PATH = SERVICES.path.docugen_web.administration.monitor;
const CONFIGURATION_PATH = SERVICES.path.docugen_web.administration.configuration;

const RESOURCE_SYSTEM_PARAMETERS_PATH =
  SERVICES.path.docugen_web.administration.resource.system_parameters;
const RESOURCE_ACCOUNTS_PATH = SERVICES.path.docugen_web.administration.resource.accounts;
const RESOURCE_SERVICES_PATH = SERVICES.path.docugen_web.administration.resource.services;

export const AdministrationService = {
  configSystemParameter: (payload) => {
    return axiosInstance.post(
      ADMINISTRATION_BASE_PATH + CONFIGURATION_PATH + RESOURCE_SYSTEM_PARAMETERS_PATH,
      payload
    );
  },
  monitorSystemParameters: (params) => {
    return axiosInstance.get(
      ADMINISTRATION_BASE_PATH + MONITOR_PATH + RESOURCE_SYSTEM_PARAMETERS_PATH,
      { params }
    );
  },
  configAccounts: (payload) => {
    return axiosInstance.post(
      ADMINISTRATION_BASE_PATH + CONFIGURATION_PATH + RESOURCE_ACCOUNTS_PATH,
      payload
    );
  },
  monitorAccounts: (params) => {
    return axiosInstance.get(ADMINISTRATION_BASE_PATH + MONITOR_PATH + RESOURCE_ACCOUNTS_PATH, {
      params,
    });
  },
  configServices: (payload) => {
    return axiosInstance.post(
      ADMINISTRATION_BASE_PATH + CONFIGURATION_PATH + RESOURCE_SERVICES_PATH,
      payload
    );
  },
  monitorServices: (params) => {
    return axiosInstance.get(ADMINISTRATION_BASE_PATH + MONITOR_PATH + RESOURCE_SERVICES_PATH, {
      params,
    });
  },
};
