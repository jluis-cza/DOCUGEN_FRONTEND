import { useAccountStore } from '../../stores/docugen-web/accountStore.js';
import { useSessionStore } from '../../stores/docugen-web/sessionStore.js';
import { useTokenStore } from '../../stores/docugen-web/tokenStore.js';
import { AdmissionService } from '../../services/docugen-web/AdmissionService.js';
import router from '../../router/index.js';

export const accessRenewer = async () => {
  const accountStore = useAccountStore();
  const sessionStore = useSessionStore();
  const tokenStore = useTokenStore();
  console.log('Renewing access...');
  const response = await AdmissionService.renewAccess();
  tokenStore.setToken(response.data.data.token);
  sessionStore.setSession(response.data.data.session);
  accountStore.setAccount(response.data.data.account);
  console.log('Access renewed');
};

export const accessRemover = () => {
  const accountStore = useAccountStore();
  const sessionStore = useSessionStore();
  const tokenStore = useTokenStore();
  console.log('Removing access...');
  tokenStore.resetToken();
  sessionStore.resetSession();
  accountStore.resetAccount();
  router.push('/login'); // login redirect
  // window.location.reload()
  console.log('Access removed');
};
