import assert from 'node:assert/strict';
import JSZip from 'jszip';
import { test } from 'node:test';
import {
  createBulkDocumentsArchive,
  createBulkDocumentsTsv,
} from '../src/helpers/docugen-app/bulkDocumentArchive.js';

test('creates a TSV index with image filenames instead of image Base64', () => {
  const imageBase64 = `data:image/png;base64,${'A'.repeat(800)}`;
  const longText = 'x'.repeat(230);
  const tsv = createBulkDocumentsTsv(
    [
      {
        fileName: 'contrato.pdf',
        imageFileNames: { photo: 'foto familiar.png' },
        data: {
          name: 'Ada\tLovelace',
          photo: imageBase64,
          avatar: 'https://example.com/images/avatar.png?size=large',
          notes: longText,
        },
      },
      { fileName: 'otro.pdf', data: { name: 'Grace', photo: imageBase64, notes: '' } },
    ],
    [
      { key: 'name', label: 'Nombre' },
      { key: 'photo', label: 'Fotografía', type: 'image' },
      { key: 'avatar', label: 'Avatar', type: 'image' },
      { key: 'notes', label: 'Notas' },
    ]
  );

  assert.match(tsv, /Nombre\tFotografía\tAvatar\tNotas/);
  assert.match(tsv, /"Ada\tLovelace"/);
  assert.match(tsv, /foto familiar\.png\tavatar\.png/);
  assert.match(tsv, /\[Imagen; nombre no disponible\]/);
  assert.match(tsv, /\[abreviado; 230 caracteres\]/);
  assert.equal(tsv.includes(imageBase64), false);
});

test('includes every PDF and its corresponding filename in one ZIP archive', async () => {
  const fetchedUrls = [];
  const archive = await createBulkDocumentsArchive({
    rows: [
      { fileName: 'contrato.pdf', url: '/pdf/1', data: { nombre: 'Ada' } },
      { fileName: 'contrato.pdf', url: '/pdf/2', data: { nombre: 'Grace' } },
    ],
    placeholders: [{ key: 'nombre', label: 'Nombre' }],
    fetchPdf: async (url) => {
      fetchedUrls.push(url);
      return new Blob([`contenido de ${url}`], { type: 'application/pdf' });
    },
  });
  const zip = await JSZip.loadAsync(await archive.arrayBuffer());

  assert.deepEqual(fetchedUrls, ['/pdf/1', '/pdf/2']);
  assert.deepEqual(Object.keys(zip.files).sort(), [
    'contrato (2).pdf',
    'contrato.pdf',
    'documentos.tsv',
  ]);
  assert.equal(await zip.file('contrato.pdf').async('string'), 'contenido de /pdf/1');
  assert.equal(await zip.file('contrato (2).pdf').async('string'), 'contenido de /pdf/2');
  const index = await zip.file('documentos.tsv').async('string');
  assert.match(index, /contrato\.pdf\tAda/);
  assert.match(index, /contrato \(2\)\.pdf\tGrace/);
});

test('rejects generated PDFs without a filename instead of creating an incomplete archive', async () => {
  await assert.rejects(
    createBulkDocumentsArchive({
      rows: [{ url: '/pdf/1', data: {} }],
      placeholders: [],
      fetchPdf: async () => new Blob(['pdf']),
    }),
    /nombre de archivo válido/
  );
});
