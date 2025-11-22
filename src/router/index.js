import { createRouter, createWebHistory } from 'vue-router';
import { login } from './docugen-web/admissionLogin';
import { register } from './docugen-web/admissionRegister';

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
    {
    path: '/weather',
    name: 'weather',
    meta: {},
    component: () => import('../views/WeatherView.vue'),
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
