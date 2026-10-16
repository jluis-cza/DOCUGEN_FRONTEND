import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  extractPlaceholders,
  validateConfigData,
} from '../src/composables/docugen-app/usePresentationConfig.js';

test('extracts element placeholders, preserves optional fields, and reserves page numbers', () => {
  const placeholders = extractPlaceholders({
    metadata: {
      dynamicParameters: [
        { key: 'optional_note', label: 'Nota opcional', type: 'textarea', required: false },
        { key: 'page_number', type: 'number', required: true },
      ],
    },
    elements: [
      { id: 'text-1', type: 'text', text: 'Hola {{customer_name}}' },
      { id: 'checkbox-1', type: 'checkbox', placeholderKey: 'accepted' },
      { id: 'page-1', type: 'pageNumber', text: 'Página {{page_number}}' },
    ],
  });

  assert.deepEqual(Object.keys(placeholders).sort(), [
    'accepted',
    'customer_name',
    'optional_note',
  ]);
  assert.equal(placeholders.accepted.type, 'boolean');
  assert.equal(placeholders.optional_note.required, false);
});

test('validates dynamic values according to metadata types', () => {
  const placeholders = {
    accepted: { key: 'accepted', type: 'boolean', required: true },
    count: { key: 'count', type: 'number', required: true },
    optional: { key: 'optional', type: 'text', required: false },
  };

  assert.equal(
    validateConfigData({ accepted: false, count: 0, optional: '' }, placeholders).isValid,
    true
  );
  assert.equal(
    validateConfigData({ accepted: 'maybe', count: 'many' }, placeholders).isValid,
    false
  );
  assert.equal(validateConfigData({ accepted: true }, placeholders).errors.count, 'count es requerido');
});
