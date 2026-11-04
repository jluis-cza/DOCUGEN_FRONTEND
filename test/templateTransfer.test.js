import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildExportFileName,
  createTemplateExportPayload,
  extractStaticParameters,
  normalizeImportedTemplate,
} from '../src/helpers/docugen-web/managementTemplateTransferHelper.js';

test('normalizes imported templates while keeping the source filename as the copy name', () => {
  const importedAt = '2026-10-27T00:00:00.000Z';
  const template = normalizeImportedTemplate(
    {
      name: 'Contrato',
      dimensions: { width: '816', height: '1056' },
      elements: [{ id: 'name', type: 'text', text: '{{client}}' }],
      metadata: { resources: [] },
    },
    'contrato-copia',
    importedAt
  );

  assert.equal(template.name, 'contrato-copia');
  assert.deepEqual(template.dimensions, { width: 816, height: 1056, unit: 'px' });
  assert.deepEqual(template.metadata, {
    resources: [],
    schemaVersion: 1,
    importedAt,
    importedFrom: 'contrato-copia',
  });
});

test('rejects imported templates with server-owned metadata and unsupported elements', () => {
  assert.throws(
    () =>
      normalizeImportedTemplate({
        _id: 'server-id',
        name: 'Contrato',
        dimensions: {},
        elements: [],
      }),
    /metadatos internos/
  );
  assert.throws(
    () =>
      normalizeImportedTemplate({
        name: 'Contrato',
        dimensions: {},
        elements: [{ id: 'custom', type: 'unknown' }],
      }),
    /no es compatible/
  );
});

test('extracts static parameters from placeholder fields and text', () => {
  assert.deepEqual(
    extractStaticParameters({
      elements: [
        { id: 'one', type: 'text', placeholderKey: 'client_name' },
        { id: 'two', type: 'text', text: 'Hello {{client_name}} {{city}}' },
      ],
    }),
    [
      {
        key: 'city',
        label: 'city',
        type: 'text',
        required: true,
        source: 'texto',
      },
      {
        key: 'client_name',
        label: 'client_name',
        type: 'text',
        required: true,
        source: 'placeholder',
      },
    ]
  );
});

test('creates a portable export payload and a deterministic export filename', () => {
  const exportedAt = '2026-10-27T12:34:56.000Z';
  const payload = createTemplateExportPayload(
    {
      name: 'Contrato de prueba',
      elements: [{ id: 'name', type: 'text' }],
    },
    exportedAt
  );

  assert.equal(payload.name, 'Contrato de prueba');
  assert.equal(payload.metadata.exportedAt, exportedAt);
  assert.equal(payload.metadata.exportVersion, 1);
  assert.equal('_id' in payload, false);
  assert.equal(
    buildExportFileName('Contrato de prueba', new Date(exportedAt)),
    'contrato-de-prueba_20261027_123456.json'
  );
});
