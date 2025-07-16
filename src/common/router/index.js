import { createRouter, createWebHistory } from 'vue-router';
import { login } from '../../modules/docugen-web/admission/router/login';
import { register } from '../../modules/docugen-web/admission/router/register';

const routes = [
  //Start page
  {
    path: '/',
    name: 'home',
    meta: {},
    component: () => import('../views/HomeView.vue'),
  },

  //docugen-web
  ...login,
  ...register,

  //docugen-app

  // Tests
  {
    path: '/counter',
    name: 'counter',
    meta: {},
    component: () => import('../views/CounterView.vue'),
  },

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

export default router;
