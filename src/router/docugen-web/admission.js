export const admission = [
  {
    path: '/register',
    name: 'register',
    meta: {},
    component: () => import('../../views/docugen-web/AdmissionRegisterView.vue'),
  },
  {
    path: '/login',
    name: 'login',
    meta: {},
    component: () => import('../../views/docugen-web/AdmissionLoginView.vue'),
  },
  {
    path: '/verification',
    name: 'verification',
    meta: {},
    component: () => import('../../views/docugen-web/AdmissionVerificationView.vue'),
  },
];
