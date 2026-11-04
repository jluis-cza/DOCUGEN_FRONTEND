import { createRouter, createWebHistory } from 'vue-router';
import { admission } from './docugen-web/admission.js';
import { administrationManagement } from './docugen-web/administrationManagement.js';
import { acquisitionRoutes } from './docugen-app/acquisitionRoutes.js';
import { editorRoutes } from './docugen-app/editorRoutes.js';
import { processingRoutes } from './docugen-app/processingRoutes.js';
import { presentationRoutes } from './docugen-app/presentationRoutes.js';
import guard from './guard.js';
import { useOverlayStore } from '../stores/utils/overlayStore.js';

const routes = [
  //  DOCUGEN-WEB
  {
    path: '/',
    name: 'welcome',
    meta: {},
    component: () => import('../views/docugen-web/WelcomeView.vue'),
  },
  {
    path: '/information',
    name: 'information',
    meta: {},
    component: () => import('../views/docugen-web/InformationView.vue'),
  },
  {
    path: '/manual',
    name: 'manual',
    meta: {},
    component: () => import('../views/docugen-web/ManualView.vue'),
  },
  {
    path: '/qa',
    name: 'qa',
    meta: {},
    component: () => import('../views/docugen-web/QAView.vue'),
  },
  {
    path: '/suspension',
    redirect: '/qa',
  },
  ...admission,
  ...administrationManagement,
  // DOCUGEN-APP
  ...acquisitionRoutes,
  ...editorRoutes,
  ...processingRoutes,
  ...presentationRoutes,

  //  EXCEPTIONS
  {
    path: '/:pathMatch(.*)*',
    component: () => import('../views/utils/NotFoundView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(() => {
  useOverlayStore().setOverlay({});
});
router.afterEach((to, from, failure) => {
  if (failure || to.name !== 'account-detail') {
    useOverlayStore().resetOverlay();
  }
});
router.onError(() => {
  useOverlayStore().resetOverlay();
});

guard(router);

export default router;
