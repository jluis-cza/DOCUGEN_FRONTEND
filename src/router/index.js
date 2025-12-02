import { createRouter, createWebHistory } from 'vue-router';
import { login } from './docugen-web/admissionLogin.js';
import { register } from './docugen-web/admissionRegister.js';
import { dashboard } from './docugen-web/administrationManagementDashboard.js';

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
  ...dashboard,
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

// Global guard
router.beforeEach((to, from, next) => {
  // Checking is autentication is needed to access the route
  if (to.meta.requiresAuth) {
    //Checking token existence
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Access failed. No token found');
      next('/login');
    } else {
      const role = localStorage.getItem('role');
      if(to.meta.allowedRoles.includes(role)){
        console.log('Access granted');
        next();
      }else{
        console.log('Access failed. No role found.');
        next('/login');
      }
    }
  } else {
    next();
  }
});

export default router;
