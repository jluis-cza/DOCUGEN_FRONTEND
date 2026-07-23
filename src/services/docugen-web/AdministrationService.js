// Administration HTTP services using the axios instance

import { axiosInstance } from '../AxiosInstanceService.js';
import { SERVICES } from '@/constants/services.js';

const ADMINISTRATION_BASE_PATH = SERVICES.path.docugen_web.administration.base;
const MONITOR_PATH = SERVICES.path.docugen_web.administration.monitor;
const CONFIGURATION_PATH = SERVICES.path.docugen_web.administration.configuration;
const LOOKUP_PATH = SERVICES.path.docugen_web.administration.lookup;
const REVIEW_PATH = SERVICES.path.docugen_web.administration.review;

// Main resources
const RESOURCE_SYSTEM_PARAMETERS_PATH =
  SERVICES.path.docugen_web.administration.resource.system_parameters.base;
const RESOURCE_ACCOUNTS_PATH = SERVICES.path.docugen_web.administration.resource.accounts.base;
const RESOURCE_SERVICES_PATH = SERVICES.path.docugen_web.administration.resource.services.base;

// Secondary resources
const RESOURCE_SESSIONS_PATH =
  SERVICES.path.docugen_web.administration.resource.accounts.resource.sessions.base;

export const AdministrationService = {
  // *************************************************************************************************
  // System Parameters
  configSystemParameter: (id, payload) => {
    return axiosInstance.post(
      ADMINISTRATION_BASE_PATH + CONFIGURATION_PATH + RESOURCE_SYSTEM_PARAMETERS_PATH + `/${id}`,
      payload
    );
  },
  monitorSystemParameter: (id) => {
    return axiosInstance.get(
      ADMINISTRATION_BASE_PATH + MONITOR_PATH + RESOURCE_SYSTEM_PARAMETERS_PATH + `/${id}`
    );
  },
  monitorSystemParameters: () => {
    return axiosInstance.get(
      ADMINISTRATION_BASE_PATH + MONITOR_PATH + RESOURCE_SYSTEM_PARAMETERS_PATH
    );
  },
  overviewSystemParameters: () => {
    return axiosInstance.get(
      ADMINISTRATION_BASE_PATH + REVIEW_PATH + RESOURCE_SYSTEM_PARAMETERS_PATH
    );
  },
  // *************************************************************************************************
  // Accounts
  configAccount: (id, payload) => {
    return axiosInstance.post(
      ADMINISTRATION_BASE_PATH + CONFIGURATION_PATH + RESOURCE_ACCOUNTS_PATH + `/${id}`,
      payload
    );
  },
  monitorAccount: (id) => {
    return axiosInstance.get(
      ADMINISTRATION_BASE_PATH + MONITOR_PATH + RESOURCE_ACCOUNTS_PATH + `/${id}`
    );
  },
  monitorAccounts: (params) => {
    return axiosInstance.get(ADMINISTRATION_BASE_PATH + MONITOR_PATH + RESOURCE_ACCOUNTS_PATH, {
      params,
    });
  },
  monitorAccountsServices: (params) => {
    return axiosInstance.get(
      ADMINISTRATION_BASE_PATH + MONITOR_PATH + RESOURCE_ACCOUNTS_PATH + RESOURCE_SERVICES_PATH,
      {
        params,
      }
    );
  },
  overviewAccounts: () => {
    return axiosInstance.get(ADMINISTRATION_BASE_PATH + REVIEW_PATH + RESOURCE_ACCOUNTS_PATH);
  },
  // *************************************************************************************************
  // Services
  monitorServices: (id, params) => {
    return axiosInstance.get(
      ADMINISTRATION_BASE_PATH +
        MONITOR_PATH +
        RESOURCE_ACCOUNTS_PATH +
        `/${id}` +
        RESOURCE_SERVICES_PATH,
      { params }
    );
  },
  configService: (id, payload) => {
    return axiosInstance.post(
      ADMINISTRATION_BASE_PATH + CONFIGURATION_PATH + RESOURCE_SERVICES_PATH + `/${id}`,
      payload
    );
  },
  configServiceLookup: (id, payload) => {
    return axiosInstance.post(
      ADMINISTRATION_BASE_PATH +
        CONFIGURATION_PATH +
        LOOKUP_PATH +
        RESOURCE_SERVICES_PATH +
        `/${id}`,
      payload
    );
  },
  monitorServiceLookup: (id) => {
    return axiosInstance.get(
      ADMINISTRATION_BASE_PATH + MONITOR_PATH + LOOKUP_PATH + RESOURCE_SERVICES_PATH + `/${id}`
    );
  },
  monitorServiceLookups: () => {
    return axiosInstance.get(
      ADMINISTRATION_BASE_PATH + MONITOR_PATH + LOOKUP_PATH + RESOURCE_SERVICES_PATH
    );
  },
  overviewServiceLookups: () => {
    return axiosInstance.get(
      ADMINISTRATION_BASE_PATH + REVIEW_PATH + LOOKUP_PATH + RESOURCE_SERVICES_PATH
    );
  },
  // *************************************************************************************************
  // Sessions
  monitorSessions: (id, params) => {
    return axiosInstance.get(
      ADMINISTRATION_BASE_PATH +
        MONITOR_PATH +
        RESOURCE_ACCOUNTS_PATH +
        `/${id}` +
        RESOURCE_SESSIONS_PATH,
      { params }
    );
  },
};
