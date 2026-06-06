//This router configuration serves to both: Administration and Management subviews of the Dashboard view.

import { USERS } from '../../constants/users.js';

const ADMIN_ROLE = USERS.type.server.role.administrator;
const DEV_ROLE = USERS.type.client.role.developer;

export const dashboard = [
  {
    path: '/dashboard',
    name: 'dashboard',
    redirect: '/dashboard/home',
    meta: { requiresAuth: true, allowedRoles: [ADMIN_ROLE, DEV_ROLE] },
    component: () => import('../../views/docugen-web/DashboardView.vue'),
    children: [
      // Home
      {
        path: 'home',
        name: 'dashboard-home',
        meta: { requiresAuth: true, allowedRoles: [ADMIN_ROLE, DEV_ROLE] },
        component: () => import('../../components/docugen-web/DashboardHome.vue'),
      },
      // Administration subroutes
      {
        path: 'system',
        name: 'system',
        meta: { requiresAuth: true, allowedRoles: [ADMIN_ROLE] },
        component: () => import('../../components/docugen-web/AdministrationSystemParameters.vue'),
        children: [
          {
            path: ':systemParameterId',
            name: 'system-parameter-detail',
            component: () =>
              import('../../components/docugen-web/AdministrationSystemParameter.vue'),
          },
        ],
      },
      {
        path: 'accounts',
        name: 'accounts',
        meta: { requiresAuth: true, allowedRoles: [ADMIN_ROLE] },
        component: () => import('../../components/docugen-web/AdministrationAccounts.vue'),
        children: [
          {
            path: ':accountId',
            name: 'account-detail',
            meta: { requiresAuth: true, allowedRoles: [ADMIN_ROLE] },
            component: () => import('../../components/docugen-web/AdministrationAccount.vue'),
            children: [
              {
                path: 'sessions',
                name: 'sessions',
                meta: { requiresAuth: true, allowedRoles: [ADMIN_ROLE] },
                component: () =>
                  import('../../components/docugen-web/AdministrationAccountSessions.vue'),
                children: [
                  {
                    path: ':sessionId',
                    name: 'session-detail',
                    meta: { requiresAuth: true, allowedRoles: [ADMIN_ROLE] },
                    component: () =>
                      import('../../components/docugen-web/AdministrationAccountSession.vue'),
                  },
                ],
              },
              {
                path: 'services',
                name: 'account-services',
                meta: { requiresAuth: true, allowedRoles: [ADMIN_ROLE] },
                component: () =>
                  import('../../components/docugen-web/AdministrationAccountServices.vue'),
              },
            ],
          },
        ],
      },
      {
        path: 'services',
        name: 'service-lookups',
        meta: { requiresAuth: true, allowedRoles: [ADMIN_ROLE] },
        component: () => import('../../components/docugen-web/AdministrationServiceLookups.vue'),
        children: [
          {
            path: ':serviceId',
            name: 'service-lookup-detail',
            meta: { requiresAuth: true, allowedRoles: [ADMIN_ROLE] },
            component: () => import('../../components/docugen-web/AdministrationServiceLookup.vue'),
          },
        ],
      },
      // Management subroutes
      {
        path: 'templates',
        name: 'templates',
        meta: { requiresAuth: true, allowedRoles: [DEV_ROLE] },
        component: () => import('../../components/docugen-web/ManagementTemplates.vue'),
      },
    ],
  },
];
