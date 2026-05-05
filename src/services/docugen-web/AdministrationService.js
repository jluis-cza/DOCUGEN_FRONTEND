// Admission HTTP services using the axios instance

import { axiosInstance } from '../AxiosInstanceService.js';
import { SERVICES } from '@/constants/services.js';

const ADMINISTRATION_BASE_PATH = SERVICES.path.docugen_web.administration.base;
const MONITOR_PATH = SERVICES.path.docugen_web.administration.monitor;
const CONFIGURATION_PATH = SERVICES.path.docugen_web.administration.configuration;

const RESOURCE_SYSTEM_PARAMETERS_PATH =
  SERVICES.path.docugen_web.administration.resource.system_parameters.base;
const RESOURCE_ACCOUNTS_PATH = SERVICES.path.docugen_web.administration.resource.accounts.base;
const RESOURCE_SERVICES_PATH = SERVICES.path.docugen_web.administration.resource.services.base;

export const AdministrationService = {
  configSystemParameter: (id, payload) => {
    const SYSTEM_PARAMETER_ID_PARAM_PATH = `/${id}`;
    return axiosInstance.post(
      ADMINISTRATION_BASE_PATH +
        CONFIGURATION_PATH +
        RESOURCE_SYSTEM_PARAMETERS_PATH +
        SYSTEM_PARAMETER_ID_PARAM_PATH,
      payload
    );
  },
  monitorSystemParameters: () => {
    return axiosInstance.get(
      ADMINISTRATION_BASE_PATH + MONITOR_PATH + RESOURCE_SYSTEM_PARAMETERS_PATH
    );
  },
  configAccount: (id, payload) => {
    const ACCOUNT_ID_PARAM_PATH = `/${id}`;
    return axiosInstance.post(
      ADMINISTRATION_BASE_PATH +
        CONFIGURATION_PATH +
        RESOURCE_ACCOUNTS_PATH +
        ACCOUNT_ID_PARAM_PATH,
      payload
    );
  },
  monitorAccounts: (params) => {
    return axiosInstance.get(ADMINISTRATION_BASE_PATH + MONITOR_PATH + RESOURCE_ACCOUNTS_PATH, {
      params,
    });
  },
  configService: (id, payload) => {
    const SERVICE_ID_PARAM_PATH = `/${id}`;
    return axiosInstance.post(
      ADMINISTRATION_BASE_PATH +
        CONFIGURATION_PATH +
        RESOURCE_SERVICES_PATH +
        SERVICE_ID_PARAM_PATH,
      payload
    );
  },
  monitorServices: () => {
    return axiosInstance.get(ADMINISTRATION_BASE_PATH + MONITOR_PATH + RESOURCE_SERVICES_PATH);
  },
};
