import { USERS } from '../../constants/users.js';

const ADMIN_ROLE = USERS.type.server.role.administrator;
const DEV_ROLE = USERS.type.client.role.developer;

export const administrationManagement = [
  {
    path: '/dashboard',
    name: 'dashboard',
    redirect: '/dashboard/home',
    meta: { requiresAuth: true, allowedRoles: [ADMIN_ROLE, DEV_ROLE] },
    component: () => import('../../views/docugen-web/AdministrationManagementDashboardView.vue'),
    children: [
      // Dashboard - Home
      {
        path: 'home',
        name: 'home',
        meta: { requiresAuth: true, allowedRoles: [ADMIN_ROLE, DEV_ROLE] },
        component: () => import('../../components/docugen-web/AdministrationManagementHome.vue'),
      },

      // System Parameters
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

      // Accounts
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
              },
              {
                path: 'services',
                name: 'account-services',
                meta: { requiresAuth: true, allowedRoles: [ADMIN_ROLE] },
                component: () =>
                  import('../../components/docugen-web/AdministrationAccountServices.vue'),
              },
              {
                path: 'notifications',
                name: 'account-notifications',
                meta: { requiresAuth: true, allowedRoles: [ADMIN_ROLE] },
                component: () =>
                  import('../../components/docugen-web/ManagementAccountNotifications.vue'),
              },
            ],
          },
        ],
      },

      // Services
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

      // My Profile
      {
        path: 'my-profile',
        name: 'my-profile',
        meta: { requiresAuth: true, allowedRoles: [ADMIN_ROLE, DEV_ROLE] },
        component: () => import('../../components/docugen-web/ManagementMyProfile.vue'),
        children: [
          {
            path: 'api-tokens',
            name: 'my-profile-api-tokens',
            meta: { requiresAuth: true, allowedRoles: [ADMIN_ROLE, DEV_ROLE] },
            component: () => import('../../components/docugen-app/APITokenManagement.vue'),
          },
        ],
      },

      // Templates
      {
        path: 'templates',
        name: 'templates',
        meta: { requiresAuth: true, allowedRoles: [DEV_ROLE] },
        component: () => import('../../components/docugen-app/TemplateList.vue'),
      },
    ],
  },
];
