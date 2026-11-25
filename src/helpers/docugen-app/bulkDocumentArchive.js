import JSZip from 'jszip';

const MAX_CELL_LENGTH = 200;
const MAX_SERIALIZED_LENGTH = 500;

const abbreviateString = (value) => {
  const imageBase64 = value.match(/^data:image\/[^;,]+;base64,([\s\S]*)$/i);
  const base64 = imageBase64?.[1] || '';

  if (base64.length > MAX_CELL_LENGTH) {
    const byteLength = Math.floor((base64.length * 3) / 4);
    return `[Base64 omitido; aproximadamente ${byteLength} bytes]`;
  }
  if (value.length > MAX_CELL_LENGTH) {
    return `${value.slice(0, MAX_CELL_LENGTH)}… [abreviado; ${value.length} caracteres]`;
  }
  return value;
};

const formatValue = (value) => {
  if (typeof value === 'string') return abbreviateString(value);
  if (value === null || value === undefined) return '';
  if (typeof value !== 'object') return value;

  const serialized = JSON.stringify(value, (_key, nestedValue) =>
    typeof nestedValue === 'string' ? abbreviateString(nestedValue) : nestedValue
  );
  if (serialized.length > MAX_SERIALIZED_LENGTH) {
    return `${serialized.slice(0, MAX_CELL_LENGTH)}… [abreviado; ${serialized.length} caracteres]`;
  }
  return serialized;
};

const getImageFileName = (value) => {
  const fileName = String(value || '')
    .split(/[?#]/, 1)[0]
    .split(/[\\/]/)
    .pop();
  return fileName || '';
};

const formatImageValue = (value, uploadedFileName) => {
  if (value === null || value === undefined || value === '') return '';
  const fileName = getImageFileName(uploadedFileName);
  if (fileName) return fileName;
  if (/^data:image\//i.test(String(value))) return '[Imagen; nombre no disponible]';
  return getImageFileName(value) || '[Imagen; nombre no disponible]';
};

const formatCell = (value) => {
  const text = String(value ?? '');
  const safeText = typeof value === 'string' && /^\s*[=+\-@]/.test(text) ? `'${text}` : text;
  return /[\t\r\n"]/.test(safeText) ? `"${safeText.replaceAll('"', '""')}"` : safeText;
};

export const createBulkDocumentsTsv = (rows, placeholders) => {
  const imageKeys = new Set(
    placeholders.filter((placeholder) => placeholder.type === 'image').map(({ key }) => key)
  );
  const fieldKeys = [
    ...new Set([
      ...placeholders.map((placeholder) => placeholder.key),
      ...rows.flatMap((row) => Object.keys(row.data || {})),
    ]),
  ];
  const headers = [
    'N.º',
    'Archivo PDF',
    ...fieldKeys.map(
      (key) => placeholders.find((placeholder) => placeholder.key === key)?.label || key
    ),
  ];
  const lines = [
    headers.map(formatCell).join('\t'),
    ...rows.map((row, index) =>
      [
        index + 1,
        row.archiveFileName || row.fileName,
        ...fieldKeys.map((key) =>
          imageKeys.has(key)
            ? formatImageValue(row.data?.[key], row.imageFileNames?.[key])
            : formatValue(row.data?.[key])
        ),
      ]
        .map(formatCell)
        .join('\t')
    ),
  ];

  return `\uFEFF${lines.join('\r\n')}`;
};

const getArchiveFileName = (fileName, usedFileNames) => {
  const safeFileName = String(fileName || '')
    .split(/[\\/]/)
    .pop()
    ?.split('')
    .map((character) => (character.charCodeAt(0) < 32 ? '_' : character))
    .join('');
  if (!safeFileName) throw new Error('Un PDF generado no tiene un nombre de archivo válido.');

  let candidate = safeFileName;
  let suffix = 2;
  while (usedFileNames.has(candidate.toLowerCase())) {
    const extensionIndex = safeFileName.lastIndexOf('.');
    const baseName = extensionIndex > 0 ? safeFileName.slice(0, extensionIndex) : safeFileName;
    const extension = extensionIndex > 0 ? safeFileName.slice(extensionIndex) : '';
    candidate = `${baseName} (${suffix})${extension}`;
    suffix += 1;
  }
  usedFileNames.add(candidate.toLowerCase());
  return candidate;
};

export const createBulkDocumentsArchive = async ({ rows, placeholders, fetchPdf }) => {
  const zip = new JSZip();
  const usedFileNames = new Set();
  const archiveRows = rows.map((row) => ({
    ...row,
    archiveFileName: getArchiveFileName(row.fileName, usedFileNames),
  }));

  for (const row of archiveRows) {
    if (!row.url) throw new Error(`No hay una URL disponible para ${row.archiveFileName}.`);
    zip.file(row.archiveFileName, await fetchPdf(row.url));
  }

  zip.file('documentos.tsv', createBulkDocumentsTsv(archiveRows, placeholders));
  return zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 3 },
  });
};
