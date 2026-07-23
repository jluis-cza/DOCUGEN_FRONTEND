import { createRouter, createWebHistory } from 'vue-router';
import { admission } from './docugen-web/admission.js';
import { administrationManagement } from './docugen-web/administrationManagement.js';
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
