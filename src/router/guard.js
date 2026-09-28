import { useTokenStore } from '../stores/docugen-web/tokenStore.js';
import { useMyAccountStore } from '../stores/docugen-web/myAccountStore.js';
import { accessRemover, accessRenewer } from '../helpers/docugen-web/admissionAccessHelper.js';
import { useNotificationStore } from '../stores/utils/notificationStore.js';
import { TemplateService } from '../services/docugen-app/TemplateService.js';

const AUTH_PUBLIC_PATHS = ['/login', '/register', '/verification'];

const guard = (router) => {
  // Global guard
  router.beforeEach(async (to, from, next) => {
    const tokenStore = useTokenStore();
    let currentToken = typeof tokenStore.getToken === 'string' ? tokenStore.getToken : '';

    // Checking is autentication is needed to access the route
    if (to.meta.requiresAuth) {
      const myAccountStore = useMyAccountStore();

      try {
        await accessRenewer();
      } catch (error) {
        console.error('Error validating session.', error.message);
        accessRemover();
        return next(error.response?.data?.code === 'E0170' ? '/' : '/login');
      }
      currentToken = typeof tokenStore.getToken === 'string' ? tokenStore.getToken : '';

      // Checking the user's role
      const role = myAccountStore.getMyAccount.role;
      if (currentToken && (to.meta.allowedRoles || []).includes(role)) {
        if (to.meta.requiredService) {
          const serviceCode = to.meta.requiredService === 'edition' ? 'E0820' : 'E0821';
          const serviceMessages = {
            edition: 'Servicio de edición de plantillas no disponible.',
            generation: 'Servicio de generación de documentos no disponible.',
          };

          try {
            const response = await TemplateService.getAccountServicesAvailability();
            const service = response.data?.data?.services?.[to.meta.requiredService];
            if (!service?.enabled) {
              useNotificationStore().setNotification({
                message: serviceMessages[to.meta.requiredService],
                code: serviceCode,
                mode: 'persistent',
              });
              return next(false);
            }
          } catch (error) {
            if (error.response?.data?.code === 'E0170') {
              accessRemover();
              return next('/');
            }
            useNotificationStore().setNotification({
              message: `No se pudo comprobar la disponibilidad del servicio de ${to.meta.requiredService === 'edition' ? 'edición' : 'generación'}.`,
              code: serviceCode,
              mode: 'persistent',
            });
            return next(false);
          }
        }
        console.log(`Access granted. role: ${role}`);
        return next();
      } else {
        console.error('Access failed. No role found.');
        return next('/login');
      }
    }

    // Public routes: only verify if there is an active session to redirect to dashboard.
    if (!currentToken) {
      return next();
    }

    if (currentToken && AUTH_PUBLIC_PATHS.includes(to.path)) {
      return next('/dashboard');
    }

    return next();
  });
};

export default guard;
