import assert from 'node:assert/strict';
import { ref } from 'vue';
import { test } from 'node:test';
import {
  MAX_BULK_DOCUMENTS,
  useBulkDocumentGeneration,
} from '../src/composables/docugen-app/useBulkDocumentGeneration.js';

const createHarness = (overrides = {}) => {
  const notifications = [];
  const generationStates = [];
  const templateId = ref('template-1');
  const template = ref({ name: 'Contrato' });
  const placeholders = ref({ name: { key: 'name', type: 'text', required: true } });
  const placeholdersList = ref([{ key: 'name', type: 'text', required: true }]);
  const generateDocumentsBulk = overrides.generateDocumentsBulk || (async () => ({ results: [] }));

  const generation = useBulkDocumentGeneration({
    templateId,
    template,
    placeholders,
    placeholdersList,
    generateDocumentsBulk,
    showNotification: (...notification) => notifications.push(notification),
    setGenerating: (state) => generationStates.push(state),
  });

  return { generation, notifications, generationStates };
};

test('validates bulk rows and stops before calling the processing service', async () => {
  let requests = 0;
  const { generation, notifications } = createHarness({
    generateDocumentsBulk: async () => {
      requests += 1;
      return { results: [] };
    },
  });

  assert.equal(generation.canGenerateBulk.value, false);
  await generation.generateBulkPdfs();
  assert.equal(requests, 0);
  assert.equal(generation.bulkRows.value[0].status, 'invalid');
  assert.equal(notifications[0][1], 'W0002');
});

test('submits rows and maps partial processing results back to the correct rows', async () => {
  let request;
  const { generation, notifications, generationStates } = createHarness({
    generateDocumentsBulk: async (payload) => {
      request = payload;
      return {
        results: [
          {
            id: payload.documents[0].id,
            success: true,
            url: '/generated/first.pdf',
            fileName: 'first.pdf',
          },
          {
            id: payload.documents[1].id,
            success: false,
            error: { message: 'Invalid content' },
          },
        ],
      };
    },
  });

  generation.updateBulkValue(generation.bulkRows.value[0], { key: 'name', type: 'text' }, 'Ada');
  generation.addBulkRow();
  generation.updateBulkValue(generation.bulkRows.value[1], { key: 'name', type: 'text' }, 'Grace');
  await generation.generateBulkPdfs();

  assert.equal(request.templateId, 'template-1');
  assert.equal(request.metadata.documentName, 'Contrato');
  assert.deepEqual(
    request.documents.map(({ data }) => data),
    [{ name: 'Ada' }, { name: 'Grace' }]
  );
  assert.equal(generation.bulkRows.value[0].status, 'success');
  assert.equal(generation.bulkRows.value[0].url, '/generated/first.pdf');
  assert.equal(generation.bulkRows.value[1].status, 'error');
  assert.equal(generation.bulkRows.value[1].error, 'Invalid content');
  assert.equal(generation.canGenerateBulk.value, true);
  assert.deepEqual(generationStates, [true, false]);
  assert.equal(notifications.at(-1)[1], 'S2011');
});

test('limits the number of bulk rows and keeps one row after removal', () => {
  const { generation } = createHarness();
  for (let index = 1; index < MAX_BULK_DOCUMENTS; index += 1) generation.addBulkRow();
  generation.addBulkRow();
  assert.equal(generation.bulkRows.value.length, MAX_BULK_DOCUMENTS);

  generation.removeBulkRow(generation.bulkRows.value[0].id);
  assert.equal(generation.bulkRows.value.length, MAX_BULK_DOCUMENTS - 1);
  generation.bulkRows.value = [generation.bulkRows.value[0]];
  generation.removeBulkRow(generation.bulkRows.value[0].id);
  assert.equal(generation.bulkRows.value.length, 1);
});
