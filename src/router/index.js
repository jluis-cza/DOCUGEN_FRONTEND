import { createRouter, createWebHistory } from 'vue-router';
import { login } from './docugen-web/admissionLogin.js';
import { register } from './docugen-web/admissionRegister.js';
import { dashboard } from './docugen-web/administrationManagementDashboard.js';
import { useTokenStore } from '../stores/docugen-web/tokenStore.js';
import { useAccountStore } from '../stores/docugen-web/accountStore.js';
import { useSessionStore } from '../stores/docugen-web/sessionStore.js';
import { useToken } from '../composables/docugen-web/useToken.js';

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
  const tokenStore = useTokenStore();
  const accountStore = useAccountStore();
  const sessionStore = useSessionStore();
  const { token, session, account, actions, success } = useToken();
  // Checking is autentication is needed to access the route
  if (to.meta.requiresAuth) {
    //Checking token existence
    let currentToken = tokenStore.getToken;
    if (!currentToken) {
      console.error('Access failed. No token found.');
      try {
        console.log('Trying to renew token...');
        await actions.renewToken();
        if (success.value) {
          tokenStore.setToken(token.value);
          sessionStore.setSession(session.value);
          accountStore.setAccount(account.value);
          console.log('The token successfully renewed.');
        } else {
          throw new Error('Renewing token failed.');
        }
      } catch (error) {
        console.error('Error on renewing token.', error.message);
        tokenStore.resetToken();
        sessionStore.resetSession();
        accountStore.resetAccount();
        return next('/login');
      }
    }
    // Checking the user's role
    const role = accountStore.getAccount.role;
    console.log({ role: role });
    if (to.meta.allowedRoles.includes(role)) {
      console.log(`Access granted. role: ${role}`);
      return next();
    } else {
      console.error('Access failed. No role found.');
      return next('/login');
    }
  } else {
    return next();
  }
});

export default router;
