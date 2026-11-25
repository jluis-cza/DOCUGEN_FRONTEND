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
  const isSingleGenerating = ref(false);
  const generateDocumentsBulk = overrides.generateDocumentsBulk || (async () => ({ results: [] }));

  const generation = useBulkDocumentGeneration({
    templateId,
    template,
    placeholders,
    placeholdersList,
    generateDocumentsBulk,
    showNotification: (...notification) => notifications.push(notification),
    setGenerating: (state) => generationStates.push(state),
    isSingleGenerating,
  });

  return { generation, notifications, generationStates, isSingleGenerating };
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

test('preserves the uploaded image filename for the TSV index', () => {
  const { generation } = createHarness();
  const row = generation.bulkRows.value[0];
  const image = { key: 'photo', type: 'image' };

  generation.updateBulkValue(row, image, 'data:image/png;base64,AAAA', 'portrait.png');
  assert.equal(row.imageFileNames.photo, 'portrait.png');

  generation.updateBulkValue(row, image, 'https://example.com/new-portrait.jpg');
  assert.equal(row.imageFileNames.photo, undefined);
});

test('prevents bulk generation while an individual PDF is being generated', async () => {
  let requests = 0;
  const { generation, isSingleGenerating } = createHarness({
    generateDocumentsBulk: async () => {
      requests += 1;
      return { results: [] };
    },
  });
  generation.updateBulkValue(generation.bulkRows.value[0], { key: 'name', type: 'text' }, 'Ada');
  isSingleGenerating.value = true;

  assert.equal(generation.canGenerateBulk.value, false);
  await generation.generateBulkPdfs();
  assert.equal(requests, 0);
});

test('downloads successful PDFs through a single ZIP download', async () => {
  const originalFetch = globalThis.fetch;
  const originalDocument = globalThis.document;
  const originalWindow = globalThis.window;
  const requestedUrls = [];
  let downloadClicks = 0;
  let downloadedFileName = '';
  const { generation, notifications } = createHarness({
    generateDocumentsBulk: async ({ documents }) => ({
      results: documents.map((document, index) => ({
        id: document.id,
        success: true,
        url: `/generated/${index + 1}.pdf`,
        fileName: `document-${index + 1}.pdf`,
      })),
    }),
  });

  globalThis.fetch = async (url) => {
    requestedUrls.push(url);
    return new Response(`PDF content ${url}`);
  };
  globalThis.document = {
    createElement: () => ({
      click: () => {
        downloadClicks += 1;
      },
      remove: () => {},
      set download(fileName) {
        downloadedFileName = fileName;
      },
    }),
    body: { appendChild: () => {} },
  };
  globalThis.window = { setTimeout: (callback) => callback() };

  try {
    generation.updateBulkValue(
      generation.bulkRows.value[0],
      { key: 'name', type: 'text' },
      'Ada'
    );
    generation.addBulkRow();
    generation.updateBulkValue(
      generation.bulkRows.value[1],
      { key: 'name', type: 'text' },
      'Grace'
    );
    await generation.generateBulkPdfs();
    await generation.downloadBulkPdfs();

    assert.deepEqual(requestedUrls, ['/generated/1.pdf', '/generated/2.pdf']);
    assert.equal(downloadClicks, 1);
    assert.match(downloadedFileName, /\.zip$/);
    assert.match(notifications.at(-1)[0], /2 PDF\(s\)/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalDocument === undefined) delete globalThis.document;
    else globalThis.document = originalDocument;
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
  }
});

test('blocks bulk regeneration and row edits while the ZIP is being downloaded', async () => {
  const originalFetch = globalThis.fetch;
  const originalDocument = globalThis.document;
  const originalWindow = globalThis.window;
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;
  let resolvePdfFetch;
  let fetchCount = 0;
  let generationRequests = 0;
  const { generation } = createHarness({
    generateDocumentsBulk: async () => {
      generationRequests += 1;
      return { results: [] };
    },
  });
  const row = generation.bulkRows.value[0];
  row.data.name = 'Ada';
  row.url = '/generated/1.pdf';
  row.fileName = 'document.pdf';

  globalThis.fetch = () => {
    fetchCount += 1;
    return new Promise((resolve) => {
      resolvePdfFetch = resolve;
    });
  };
  globalThis.document = {
    createElement: () => ({ click: () => {}, remove: () => {} }),
    body: { appendChild: () => {} },
  };
  globalThis.window = { setTimeout: (callback) => callback() };
  URL.createObjectURL = () => 'blob:archive';
  URL.revokeObjectURL = () => {};

  try {
    const downloadPromise = generation.downloadBulkPdfs();
    assert.equal(generation.isBulkDownloading.value, true);
    assert.equal(generation.canGenerateBulk.value, false);

    generation.addBulkRow();
    generation.updateBulkValue(row, { key: 'name', type: 'text' }, 'Grace');
    await generation.generateBulkPdfs();
    await generation.downloadBulkPdfs();

    assert.equal(generation.bulkRows.value.length, 1);
    assert.equal(row.data.name, 'Ada');
    assert.equal(generationRequests, 0);
    assert.equal(fetchCount, 1);

    resolvePdfFetch(new Response('PDF content'));
    await downloadPromise;
    assert.equal(generation.isBulkDownloading.value, false);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalDocument === undefined) delete globalThis.document;
    else globalThis.document = originalDocument;
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  }
});
