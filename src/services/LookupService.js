// lookup HTTP services using the axios instance

import { axiosInstance } from './AxiosInstanceService.js';
import { SERVICES } from '../constants/services.js';

const LOOKUP_PATH = SERVICES.path.lookup.base;
const LOOKUP_ACCOUNTS_PATH = SERVICES.path.lookup.resource.accounts.base;
const LOOKUP_ROLES_PATH = SERVICES.path.lookup.resource.roles.base;
const LOOKUP_ROLES_ADMIN_PATH = SERVICES.path.lookup.resource.roles.admin;

export const LookupService = {
  // Getters
  getAdminAccounts: () => {
    return axiosInstance.get(
      LOOKUP_PATH + LOOKUP_ACCOUNTS_PATH + LOOKUP_ROLES_PATH + LOOKUP_ROLES_ADMIN_PATH
    );
  },
};
