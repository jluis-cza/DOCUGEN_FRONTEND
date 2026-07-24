import { useTokenStore } from '../stores/docugen-web/tokenStore.js';
import { useMyAccountStore } from '../stores/docugen-web/myAccountStore.js';
import { accessRemover, accessRenewer } from '../helpers/docugen-web/admissionAccessHelper.js';

const guard = (router) => {
  // Global guard
  router.beforeEach(async (to, from, next) => {
    // Checking is autentication is needed to access the route
    if (to.meta.requiresAuth) {
      const myAccountStore = useMyAccountStore();
      const tokenStore = useTokenStore();
      //Checking token existence
      let currentToken = tokenStore.getToken;
      if (!currentToken) {
        console.error('Access failed. No token found.');
        try {
          await accessRenewer();
        } catch (error) {
          console.error('Error on renewing token.', error.message);
          accessRemover();
          return next('/login');
        }
      }
      // Checking the user's role
      const role = myAccountStore.getMyAccount.role;
      if (to.meta.allowedRoles.includes(role)) {
        console.log(`Access granted. role: ${role}`);
        return next();
      } else {
        console.error('Access failed. No role found.');
        return next('/login');
      }
    } else {
      // Double checking user's authentication
      try {
        await accessRenewer();
        console.error('User is authenticated.');
        return next('/dashboard');
      } catch (err) {
        console.error('User is not authenticated.', err.message);
        accessRemover();
        return next();
      }
    }
  });
};

export default guard;
