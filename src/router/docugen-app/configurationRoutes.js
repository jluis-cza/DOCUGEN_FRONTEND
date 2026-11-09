import { USERS } from '../../constants/users.js';

export const configurationProfileRoutes = [
  {
    path: 'api-base-url',
    meta: {
      requiresAuth: true,
      allowedRoles: [USERS.type.client.role.developer],
      roleDeniedRedirect: '/dashboard/api-configuration',
    },
    redirect: '/dashboard/api-configuration/base-url',
  },
  {
    path: 'api-tokens',
    meta: {
      requiresAuth: true,
      allowedRoles: [USERS.type.client.role.developer],
      roleDeniedRedirect: '/dashboard/api-configuration',
    },
    redirect: '/dashboard/api-configuration/tokens',
  },
];

export const configurationAPIRoutes = [
  {
    path: 'tokens',
    name: 'api-configuration-tokens',
    meta: {
      requiresAuth: true,
      allowedRoles: [USERS.type.client.role.developer],
      roleDeniedRedirect: '/dashboard/home',
    },
    component: () => import('../../components/docugen-app/ConfigurationAPITokenManagement.vue'),
  },
  {
    path: 'base-url',
    name: 'api-configuration-base-url',
    meta: {
      requiresAuth: true,
      allowedRoles: [USERS.type.client.role.developer],
      roleDeniedRedirect: '/dashboard/home',
    },
    component: () => import('../../components/docugen-app/ConfigurationAPIBaseURL.vue'),
  },
  {
    path: 'endpoints',
    name: 'api-configuration-endpoints',
    meta: {
      requiresAuth: true,
      allowedRoles: [USERS.type.client.role.developer],
      roleDeniedRedirect: '/dashboard/home',
    },
    component: () => import('../../components/docugen-app/ConfigurationAPIEndpoints.vue'),
  },
];
