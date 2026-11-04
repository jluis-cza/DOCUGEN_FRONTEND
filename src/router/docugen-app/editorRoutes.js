import { USERS } from '../../constants/users.js';

export const editorRoutes = [
  {
    path: '/templates/:templateId/edit',
    name: 'standalone-template-editor',
    meta: {
      requiresAuth: true,
      allowedRoles: [USERS.type.client.role.developer],
      requiredService: 'edition',
    },
    component: () => import('../../components/docugen-app/EditorTemplateEditor.vue'),
  },
];
