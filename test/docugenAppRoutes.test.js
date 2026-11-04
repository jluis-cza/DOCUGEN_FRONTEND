import assert from 'node:assert/strict';
import { test } from 'node:test';
import { configurationProfileRoutes } from '../src/router/docugen-app/configurationRoutes.js';
import { editorRoutes } from '../src/router/docugen-app/editorRoutes.js';
import { presentationRoutes } from '../src/router/docugen-app/presentationRoutes.js';
import { acquisitionRoutes } from '../src/router/docugen-app/acquisitionRoutes.js';
import { processingRoutes } from '../src/router/docugen-app/processingRoutes.js';
import { administrationManagement } from '../src/router/docugen-web/administrationManagement.js';

test('DOCUGEN-APP editor and presentation routes retain current paths and requirements', () => {
  assert.equal(editorRoutes.length, 1);
  assert.equal(editorRoutes[0].path, '/templates/:templateId/edit');
  assert.equal(editorRoutes[0].name, 'standalone-template-editor');
  assert.equal(editorRoutes[0].meta.requiredService, 'edition');

  assert.equal(presentationRoutes.length, 1);
  assert.equal(presentationRoutes[0].path, '/templates/:templateId/present');
  assert.equal(presentationRoutes[0].name, 'standalone-template-presentation');
  assert.equal(presentationRoutes[0].meta.requiredService, 'generation');
});

test('DOCUGEN-APP configuration route remains nested in the WEB user profile', () => {
  const dashboard = administrationManagement.find((route) => route.path === '/dashboard');
  const profile = dashboard.children.find((route) => route.path === 'my-profile');
  const apiTokens = profile.children.find((route) => route.name === 'my-profile-api-tokens');

  assert.equal(apiTokens.path, 'api-tokens');
  assert.equal(apiTokens.meta.roleDeniedRedirect, '/dashboard/my-profile');
  assert.deepEqual(apiTokens.meta.allowedRoles, configurationProfileRoutes[0].meta.allowedRoles);
});

test('acquisition catalog stays with WEB management and processing has no standalone route', () => {
  const dashboard = administrationManagement.find((route) => route.path === '/dashboard');
  const catalog = dashboard.children.find((route) => route.name === 'templates');

  assert.equal(catalog.path, 'templates');
  assert.deepEqual(acquisitionRoutes, []);
  assert.deepEqual(processingRoutes, []);
});
