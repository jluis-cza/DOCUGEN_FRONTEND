import { useTokenStore } from '../stores/docugen-web/tokenStore.js';
import { useAccountStore } from '../stores/docugen-web/accountStore.js';
import { accessRemover, accessRenewer } from '../helpers/docugen-web/accessHelper.js';

const guard = (router) => {
  // Global guard
  router.beforeEach(async (to, from, next) => {
    const tokenStore = useTokenStore();
    const accountStore = useAccountStore();
    // Checking is autentication is needed to access the route
    if (to.meta.requiresAuth) {
      //Checking token existence
      let currentToken = tokenStore.getToken;
      if (!currentToken) {
        console.error('Access failed. No token found.');
        try {
          await accessRenewer();
        } catch (error) {
          console.error('Error on renewing token.', error.message);
          return accessRemover();
          // return next('/login');
        }
      }
      // Checking the user's role
      const role = accountStore.getAccount.role;
      console.log({ role });
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
};

export default guard;
