//This router configuration serves to both: Administration and Management subviews of the Dashboard view.

import { USERS } from '../../constants/users.js';

const ADMIN_ROLE = USERS.type.server.role.administrator;
const DEV_ROLE = USERS.type.client.role.developer;

export const administrationManagement = [
  {
    path: '/dashboard',
    name: 'dashboard',
    meta: { requiresAuth: true, allowedRoles: [ADMIN_ROLE, DEV_ROLE] },
    component: () => import('../../views/docugen-web/AdministrationManagementDashboardView.vue'),
    children: [
      // Administration subroutes
      {
        path: 'system',
        name: 'system',
        meta: { requiresAuth: true, allowedRoles: [ADMIN_ROLE] },
        component: () => import('../../components/docugen-web/AdministrationSystem.vue'),
      },
      // Management subroutes
      {
        path: 'template-management',
        name: 'template-management',
        meta: { requiresAuth: true, allowedRoles: [DEV_ROLE] },
        component: () => import('../../components/docugen-web/ManagementTemplates.vue'),
      },
    ],
  },
];
