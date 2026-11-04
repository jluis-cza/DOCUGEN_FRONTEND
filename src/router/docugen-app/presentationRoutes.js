import { USERS } from '../../constants/users.js';

export const presentationRoutes = [
  {
    path: '/templates/:templateId/present',
    name: 'standalone-template-presentation',
    meta: {
      requiresAuth: true,
      allowedRoles: [USERS.type.client.role.developer],
      requiredService: 'generation',
    },
    component: () => import('../../components/docugen-app/PresentationTemplateView.vue'),
  },
];
