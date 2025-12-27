import { createRouter, createWebHistory } from 'vue-router';
import { login } from './docugen-web/admissionLogin.js';
import { register } from './docugen-web/admissionRegister.js';
import { dashboard } from './docugen-web/administrationManagementDashboard.js';
import { useTokenStore } from '../stores/docugen-web/tokenStore.js';

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
router.beforeEach(async (to, from, next) => {
  const token = useTokenStore();
  // Checking is autentication is needed to access the route
  if (to.meta.requiresAuth) {
    //Checking token existence
    const tokenString = token.getToken;

    if (!tokenString) {
      console.error('Access failed. No token found.');
      try {
        console.log('Trying to renew token...');
        await token.renewToken();
        const newTokenString = token.getToken || '';
        if (!newTokenString) {
          console.error('No token found after renewing process. Sending to login');
          next('/login');
        }
         console.log('The token successfully renewed.');
      } catch (error) {
        console.error('Error on renewing token.', error);
        next('/login');
      }
    }

    // Checking the user's role
    const role = token.getInfo.role;
    if (to.meta.allowedRoles.includes(role)) {
      console.log(`Access granted. role: ${role}`);
      next();
    } else {
      console.error('Access failed. No role found.');
      next('/login');
    }
  } else {
    next();
  }
});

export default router;
