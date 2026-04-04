import { createRouter, createWebHistory } from 'vue-router';
import { login } from './docugen-web/admissionLogin.js';
import { register } from './docugen-web/admissionRegister.js';
import { verification } from './docugen-web/admissionVerification.js';
import { dashboard } from './docugen-web/administrationManagementDashboard.js';
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
  ...login,
  ...register,
  ...dashboard,
  ...verification,
  
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
