const SUPPORTED_ELEMENT_TYPES = [
  'text',
  'title',
  'subtitle',
  'paragraph',
  'list',
  'image',
  'placeholder',
  'date',
  'pageNumber',
  'rect',
  'line',
  'footer',
  'qr',
  'signature',
  'separator',
  'table',
  'checkbox',
];

export const extractStaticContent = (template) => {
  if (!template || !Array.isArray(template.elements)) return [];

  const content = [];
  template.elements.forEach((element) => {
    if (!element || element.type === 'pageNumber') return;

    for (const [field, label] of [
      ['text', 'Texto'],
      ['qrValue', 'Valor QR'],
    ]) {
      if (typeof element[field] !== 'string') continue;
      if (/\{\{\s*[A-Za-z0-9_.-]+\s*\}\}/.test(element[field])) continue;
      const value = element[field].trim();
      if (!value) continue;

      content.push({
        elementId: element.id || 'Sin identificador',
        type: element.type || 'desconocido',
        field: label,
        value,
      });
    }
  });

  return content;
};

export const getSafeTemplateName = (value, fallback = 'Plantilla importada') => {
  if (typeof value !== 'string') return fallback;
  const cleaned = value.trim();
  return cleaned || fallback;
};

export const buildExportFileName = (templateName, timestamp = new Date()) => {
  const safeName =
    (templateName || 'plantilla')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'plantilla';

  const stamp = timestamp
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, '')
    .replace('T', '_');

  return `${safeName}_${stamp}.json`;
};

export const validateTemplateImportCompatibility = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('El archivo no contiene un objeto de plantilla válido.');
  }

  if (payload._id || payload.owner || payload.createdAt || payload.updatedAt || payload.__v) {
    throw new Error(
      'La plantilla importada contiene metadatos internos que pueden producir conflictos.'
    );
  }

  const schemaVersion = payload?.metadata?.schemaVersion ?? 1;
  if (schemaVersion !== 1) {
    throw new Error('La versión de la plantilla no es compatible con esta instalación.');
  }
  if (!payload.name || typeof payload.name !== 'string') {
    throw new Error('La plantilla importada debe incluir un nombre válido.');
  }
  if (!payload.dimensions || typeof payload.dimensions !== 'object') {
    throw new Error('La plantilla importada debe incluir dimensiones válidas.');
  }
  if (!Array.isArray(payload.elements)) {
    throw new Error('La plantilla importada debe incluir un array de elementos válido.');
  }

  const firstInvalidElement = payload.elements.find(
    (element) => !element || typeof element !== 'object' || !element.id || !element.type
  );
  if (firstInvalidElement) {
    throw new Error('Hay elementos de la plantilla importada con formato incompatible.');
  }

  const unsupportedType = payload.elements.find(
    (element) => !SUPPORTED_ELEMENT_TYPES.includes(element.type)
  );
  if (unsupportedType) {
    throw new Error(
      `El tipo de elemento "${unsupportedType.type}" no es compatible con esta versión.`
    );
  }
};

export const normalizeImportedTemplate = (
  payload,
  sourceName = 'Plantilla importada',
  importedAt = new Date().toISOString()
) => {
  validateTemplateImportCompatibility(payload);

  const name = getSafeTemplateName(payload.name, sourceName);
  const description = typeof payload.description === 'string' ? payload.description : '';
  const status = ['draft', 'published', 'archived'].includes(payload.status)
    ? payload.status
    : 'draft';
  const dimensions =
    payload.dimensions && typeof payload.dimensions === 'object'
      ? {
          width: Number(payload.dimensions.width) || 794,
          height: Number(payload.dimensions.height) || 1123,
          unit: payload.dimensions.unit || 'px',
        }
      : { width: 794, height: 1123, unit: 'px' };
  const page =
    payload.page && typeof payload.page === 'object'
      ? payload.page
      : {
          backgroundColor: '#ffffff',
          margin: { top: 40, right: 40, bottom: 40, left: 40 },
        };
  const canvas =
    payload.canvas && typeof payload.canvas === 'object'
      ? payload.canvas
      : {
          version: 1,
          zoom: 1,
          background: '#ffffff',
        };
  const metadata = payload.metadata && typeof payload.metadata === 'object' ? payload.metadata : {};

  return {
    name: sourceName && sourceName !== 'Plantilla importada' ? sourceName : name,
    description,
    status,
    dimensions,
    page,
    canvas,
    elements: payload.elements,
    metadata: {
      ...metadata,
      schemaVersion: 1,
      importedAt,
      importedFrom: sourceName,
    },
  };
};

export const createTemplateExportPayload = (template, exportedAt = new Date().toISOString()) => {
  if (!Array.isArray(template?.elements)) {
    throw new Error('La plantilla recuperada no incluye su contenido completo.');
  }

  return {
    name: template.name || 'Plantilla exportada',
    description: template.description || '',
    status: template.status || 'draft',
    dimensions: template.dimensions || { width: 794, height: 1123, unit: 'px' },
    page: template.page || {
      backgroundColor: '#ffffff',
      margin: { top: 40, right: 40, bottom: 40, left: 40 },
    },
    canvas: template.canvas || {
      version: 1,
      zoom: 1,
      background: '#ffffff',
    },
    elements: template.elements,
    metadata: {
      ...(template.metadata || {}),
      schemaVersion: 1,
      exportVersion: 1,
      exportedAt,
    },
  };
};
