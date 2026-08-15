import { ref, computed } from 'vue';

const normalizePlaceholderKey = (value) => {
  if (!value || typeof value !== 'string') return '';
  return value
    .trim()
    .replace(/^\{\{\s*/, '')
    .replace(/\s*\}\}$/, '')
    .replace(/\s+/g, '_');
};

const inferParameterType = (element) => {
  if (!element || typeof element !== 'object') return 'text';

  if (element.type === 'qr') return 'qr';
  if (element.type === 'image') return 'image';
  if (element.type === 'date') return 'date';
  if (element.type === 'checkbox') return 'boolean';
  if (element.type === 'pageNumber') return 'number';
  if (element.type === 'paragraph' || element.type === 'list' || element.type === 'footer')
    return 'textarea';

  return 'text';
};

const paramSort = (a, b) => {
  const keyA = String(a.key || '').toLowerCase();
  const keyB = String(b.key || '').toLowerCase();
  return keyA.localeCompare(keyB);
};

export const extractPlaceholders = (template) => {
  if (!template || !template.elements) return {};

  const placeholderMap = {};
  const metadataParams = Array.isArray(template?.metadata?.dynamicParameters)
    ? template.metadata.dynamicParameters
    : [];

  metadataParams.forEach((param) => {
    const key = normalizePlaceholderKey(param?.key || param?.name || '');
    if (!key) return;
    placeholderMap[key] = {
      key,
      elementId: param?.elementId || '',
      elementType: param?.elementType || param?.type || 'text',
      description: param?.description || `Parámetro dinámico`,
      example: param?.example || '',
      required: Boolean(param?.required),
      type: param?.type || inferParameterType({ type: param?.elementType || 'text' }),
      allowedValues: Array.isArray(param?.allowedValues) ? param.allowedValues : undefined,
    };
  });

  template.elements.forEach((element) => {
    const explicitKey = normalizePlaceholderKey(element.placeholderKey);
    if (explicitKey) {
      if (!placeholderMap[explicitKey]) {
        placeholderMap[explicitKey] = {
          key: explicitKey,
          elementId: element.id,
          elementType: element.type,
          description: `Usado en ${element.type}`,
          example: '',
          required: true,
          type: inferParameterType(element),
        };
      }
    }

    const textContent = [
      element.text || '',
      element.qrValue || '',
      element.src || '',
      element.placeholderKey || '',
    ].join(' ');
    const matches = textContent.match(/\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g) || [];

    matches.forEach((match) => {
      const key = normalizePlaceholderKey(match);
      if (!key) return;
      if (!placeholderMap[key]) {
        placeholderMap[key] = {
          key,
          elementId: element.id,
          elementType: element.type,
          description: `Usado en ${element.type}`,
          example: '',
          required: true,
          type: inferParameterType(element),
        };
      }
    });
  });

  return Object.fromEntries(Object.entries(placeholderMap).sort(([a], [b]) => a.localeCompare(b)));
};

export const createEmptyDataObject = (placeholders) => {
  const data = {};
  Object.keys(placeholders || {}).forEach((key) => {
    data[key] = '';
  });
  return data;
};

const validateValueByType = (key, value, type, allowedValues) => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return 'es requerido';
  }

  const stringValue = String(value).trim();

  if (
    Array.isArray(allowedValues) &&
    allowedValues.length > 0 &&
    !allowedValues.includes(stringValue)
  ) {
    return `debe ser uno de: ${allowedValues.join(', ')}`;
  }

  switch (type) {
    case 'number': {
      const parsed = Number(stringValue);
      if (!Number.isFinite(parsed)) return 'debe ser numérico';
      return null;
    }
    case 'date': {
      const date = new Date(stringValue);
      if (Number.isNaN(date.getTime())) return 'debe ser una fecha válida';
      return null;
    }
    case 'boolean': {
      if (!['true', 'false', '1', '0', 'yes', 'no'].includes(stringValue.toLowerCase())) {
        return 'debe ser true/false';
      }
      return null;
    }
    case 'email': {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)) return 'debe ser un email válido';
      return null;
    }
    case 'url': {
      try {
        new URL(stringValue);
        return null;
      } catch {
        return 'debe ser una URL válida';
      }
    }
    case 'image': {
      const isValidUrl = /^https?:\/\//.test(stringValue) || /^data:image\//.test(stringValue);
      if (!isValidUrl) return 'debe ser una URL o base64 de imagen';
      return null;
    }
    case 'qr': {
      if (stringValue.length < 3) return 'debe tener contenido útil';
      return null;
    }
    case 'textarea': {
      if (stringValue.length > 4000) return 'texto demasiado largo';
      return null;
    }
    default:
      if (stringValue.length > 1200) return 'texto demasiado largo';
      return null;
  }
};

export const validateConfigData = (data, placeholders) => {
  const errors = {};

  Object.keys(placeholders || {}).forEach((key) => {
    const placeholder = placeholders[key];
    const value = data?.[key];
    const type = placeholder?.type || 'text';
    const isRequired = Boolean(placeholder?.required);

    if (isRequired && (value === undefined || value === null || String(value).trim() === '')) {
      errors[key] = `${key} es requerido`;
      return;
    }

    if (!isRequired && (value === undefined || value === null || String(value).trim() === '')) {
      return;
    }

    const message = validateValueByType(key, value, type, placeholder?.allowedValues);
    if (message) {
      errors[key] = `${key}: ${message}`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const normalizeDynamicParameters = (template) => {
  const existing = Array.isArray(template?.metadata?.dynamicParameters)
    ? template.metadata.dynamicParameters
    : [];

  const byKey = new Map();

  existing.forEach((param) => {
    const key = normalizePlaceholderKey(param?.key || param?.name || '');
    if (!key) return;
    byKey.set(key, {
      key,
      label: param?.label || key,
      type: param?.type || 'text',
      required: Boolean(param?.required),
      description: param?.description || '',
      allowedValues: Array.isArray(param?.allowedValues) ? param.allowedValues : undefined,
      example: param?.example || '',
    });
  });

  const placeholders = extractPlaceholders(template);
  Object.keys(placeholders).forEach((key) => {
    if (!byKey.has(key)) {
      byKey.set(key, {
        key,
        label: key,
        type: placeholders[key].type || 'text',
        required: Boolean(placeholders[key].required),
        description: placeholders[key].description || '',
        example: placeholders[key].example || '',
      });
    }
  });

  const list = [...byKey.values()].sort(paramSort);
  return list;
};

export const usePresentationConfig = () => {
  const template = ref({ name: '', elements: [], metadata: { dynamicParameters: [] } });
  const placeholders = ref({});
  const configData = ref({});
  const viewMode = ref('form');
  const isGenerating = ref(false);
  const pdfUrl = ref(null);
  const validationErrors = ref({});

  const placeholdersList = computed(() => Object.values(placeholders.value));

  const extractPlaceholdersFromTemplate = (tmpl) => {
    template.value = {
      ...tmpl,
      metadata: {
        ...(tmpl?.metadata || {}),
        dynamicParameters: normalizeDynamicParameters(tmpl),
      },
    };

    placeholders.value = extractPlaceholders(template.value);
    configData.value = createEmptyDataObject(placeholders.value);
    validationErrors.value = {};
  };

  const updateConfigData = (key, value) => {
    const nextValue = value ?? '';
    configData.value[key] = nextValue;
    if (validationErrors.value[key]) {
      validationErrors.value[key] = null;
    }
  };

  const setConfigDataBulk = (data) => {
    configData.value = { ...createEmptyDataObject(placeholders.value), ...(data || {}) };
    validationErrors.value = {};
  };

  const validate = () => {
    const validation = validateConfigData(configData.value, placeholders.value);
    validationErrors.value = validation.errors;
    return validation.isValid;
  };

  const toggleViewMode = () => {
    viewMode.value = viewMode.value === 'form' ? 'json' : 'form';
  };

  const resetConfig = () => {
    configData.value = createEmptyDataObject(placeholders.value);
    validationErrors.value = {};
  };

  return {
    template,
    placeholders,
    configData,
    viewMode,
    isGenerating,
    pdfUrl,
    validationErrors,
    placeholdersList,
    extractPlaceholdersFromTemplate,
    updateConfigData,
    setConfigDataBulk,
    validate,
    toggleViewMode,
    resetConfig,
  };
};
