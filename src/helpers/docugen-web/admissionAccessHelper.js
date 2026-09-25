import { useMyAccountStore } from '../../stores/docugen-web/myAccountStore.js';
import { useMySessionStore } from '../../stores/docugen-web/mySessionStore.js';
import { useTokenStore } from '../../stores/docugen-web/tokenStore.js';
import { AdmissionService } from '../../services/docugen-web/AdmissionService.js';

let accessRenewalPromise = null;

export const accessRenewer = async () => {
  if (accessRenewalPromise) return accessRenewalPromise;

  accessRenewalPromise = (async () => {
    const myAccountStore = useMyAccountStore();
    const mySessionStore = useMySessionStore();
    const tokenStore = useTokenStore();
    console.log('Renewing access...');
    const response = await AdmissionService.renewAccess();
    tokenStore.setToken(response.data.data.token);
    mySessionStore.setMySession(response.data.data.session);
    myAccountStore.setMyAccount(response.data.data.account);
    console.log('Access renewed');
  })();

  try {
    return await accessRenewalPromise;
  } finally {
    accessRenewalPromise = null;
  }
};

export const accessRemover = () => {
  const myAccountStore = useMyAccountStore();
  const mySessionStore = useMySessionStore();
  const tokenStore = useTokenStore();
  console.log('Removing access...');
  tokenStore.resetToken();
  mySessionStore.resetMySession();
  myAccountStore.resetMyAccount();
  // router.push('/login'); // login redirect
  // window.location.reload()
  console.log('Access removed');
};
