import { createRouter, createWebHistory } from 'vue-router';
import { admission } from './docugen-web/admission.js';
import { administrationManagement } from './docugen-web/administrationManagement.js';
import { USERS } from '../constants/users.js';
import guard from './guard.js';

const routes = [
  //  DOCUGEN-WEB
  {
    path: '/',
    name: 'welcome',
    meta: {},
    component: () => import('../views/docugen-web/WelcomeView.vue'),
  },
  {
    path: '/information',
    name: 'information',
    meta: {},
    component: () => import('../views/docugen-web/InformationView.vue'),
  },
  {
    path: '/manual',
    name: 'manual',
    meta: {},
    component: () => import('../views/docugen-web/ManualView.vue'),
  },
  ...admission,
  ...administrationManagement,
  {
    path: '/templates/:templateId/edit',
    name: 'standalone-template-editor',
    meta: { requiresAuth: true, allowedRoles: [USERS.type.client.role.developer] },
    component: () => import('../components/docugen-app/TemplateEditor.vue'),
  },
  {
    path: '/templates/:templateId/present',
    name: 'standalone-template-presentation',
    meta: { requiresAuth: true, allowedRoles: [USERS.type.client.role.developer] },
    component: () => import('../components/docugen-app/TemplatePresentationView.vue'),
  },

  //  DOCUGEN-APP

  //  EXCEPTIONS
  {
    path: '/:pathMatch(.*)*',
    component: () => import('../views/utils/NotFoundView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

guard(router);

export default router;
