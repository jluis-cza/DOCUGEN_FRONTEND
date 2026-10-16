import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  extractPlaceholders,
  normalizeImageValue,
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

test('infers parameter input types from dynamic element types', () => {
  const placeholders = extractPlaceholders({
    metadata: {
      dynamicParameters: [
        { key: 'long_note', elementType: 'paragraph', required: false },
        { key: 'photo', type: 'text', required: true },
      ],
    },
    elements: [
      { id: 'paragraph', type: 'paragraph', text: '{{details}}' },
      { id: 'date', type: 'date', placeholderKey: 'issued_on' },
      { id: 'image', type: 'image', placeholderKey: 'photo' },
      { id: 'qr', type: 'qr', placeholderKey: 'verification' },
      { id: 'checkbox-label', type: 'checkbox', text: 'Hello {{recipient}}' },
    ],
  });

  assert.deepEqual(
    Object.fromEntries(Object.entries(placeholders).map(([key, value]) => [key, value.type])),
    {
      details: 'textarea',
      issued_on: 'date',
      long_note: 'textarea',
      photo: 'image',
      recipient: 'text',
      verification: 'qr',
    }
  );
  assert.equal(placeholders.photo.type, 'image');
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

test('validates presentation image URLs and PNG/JPEG data URLs consistently', () => {
  const placeholders = {
    photo: { key: 'photo', type: 'image', required: true },
  };
  const validPng =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADUlEQVR4nGP4z8DwHwAFAAH/iZk9HQAAAABJRU5ErkJggg==';

  assert.equal(validateConfigData({ photo: validPng }, placeholders).isValid, true);
  const rawPng = validPng.split(',')[1];
  assert.equal(validateConfigData({ photo: rawPng }, placeholders).isValid, true);
  assert.equal(
    normalizeImageValue(rawPng),
    validPng
  );
  assert.equal(
    validateConfigData({ photo: `data:image/png;base64,${rawPng.slice(0, 28)}\n${rawPng.slice(28)}` }, placeholders).isValid,
    true
  );
  assert.equal(validateConfigData({ photo: 'https://example.test/photo.jpg' }, placeholders).isValid, true);
  assert.match(
    validateConfigData({ photo: 'data:image/gif;base64,AAAA' }, placeholders).errors.photo,
    /PNG\/JPEG/
  );
  assert.match(
    validateConfigData({ photo: 'data:image/png;base64,AAAA' }, placeholders).errors.photo,
    /PNG\/JPEG/
  );
});

test('does not ask for static image resources as dynamic presentation parameters', () => {
  assert.deepEqual(
    extractPlaceholders({
      metadata: { resources: [{ id: 'logo', name: 'logo.png' }] },
      elements: [
        {
          id: 'logo',
          type: 'image',
          imageMode: 'static',
          resourceId: 'logo',
          src: 'resource:logo',
        },
      ],
    }),
    {}
  );
});
