import { USERS } from '../../constants/users.js';

export const configurationProfileRoutes = [
  {
    path: 'api-tokens',
    name: 'my-profile-api-tokens',
    meta: {
      requiresAuth: true,
      allowedRoles: [USERS.type.client.role.developer],
      roleDeniedRedirect: '/dashboard/my-profile',
    },
    component: () => import('../../components/docugen-app/ConfigurationAPITokenManagement.vue'),
  },
];
