import { createRouter, createWebHistory } from 'vue-router';
import { admission } from './docugen-web/admission.js';
import { administrationManagement } from './docugen-web/administrationManagement.js';

import guard from './guard.js';

const routes = [
  //Start page
  {
    path: '/',
    name: 'home',
    meta: {},
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/information',
    name: 'information',
    meta: {},
    component: () => import('../views/InformationView.vue'),
  },
  {
    path: '/manual',
    name: 'manual',
    meta: {},
    component: () => import('../views/ManualView.vue'),
  },

  //docugen-web
  ...admission,
  ...administrationManagement,

  //docugen-app

  //Exceptions
  {
    path: '/:pathMatch(.*)*',
    component: () => import('../views/NotFoundView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

guard(router);

export default router;
