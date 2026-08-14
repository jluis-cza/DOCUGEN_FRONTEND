import { ref, computed } from 'vue';

/**
 * Extrae todos los placeholders únicos de una plantilla
 * Analiza todos los elementos y encuentra las claves {{key}}
 */
export const extractPlaceholders = (template) => {
  if (!template || !template.elements) return {};

  const placeholderMap = {};

  template.elements.forEach((element) => {
    // Casos 1: placeholderKey definido explícitamente
    if (element.placeholderKey) {
      if (!placeholderMap[element.placeholderKey]) {
        placeholderMap[element.placeholderKey] = {
          key: element.placeholderKey,
          elementId: element.id,
          elementType: element.type,
          description: `Usado en ${element.type}`,
          example: '',
          required: true,
        };
      }
    }

    // Caso 2: texto con {{key}} patterns
    const textContent = element.text || element.qrValue || '';
    const matches = textContent.match(/\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g);
    if (matches) {
      matches.forEach((match) => {
        const key = match.replace(/[{}]/g, '').trim();
        if (!placeholderMap[key]) {
          placeholderMap[key] = {
            key,
            elementId: element.id,
            elementType: element.type,
            description: `Usado en ${element.type}`,
            example: '',
            required: true,
          };
        }
      });
    }
  });

  return placeholderMap;
};

/**
 * Crea un objeto data vacío con todas las claves de placeholders
 */
export const createEmptyDataObject = (placeholders) => {
  const data = {};
  Object.keys(placeholders).forEach((key) => {
    data[key] = '';
  });
  return data;
};

/**
 * Valida que todos los placeholders requeridos tengan valores
 */
export const validateConfigData = (data, placeholders) => {
  const errors = {};

  Object.keys(placeholders).forEach((key) => {
    const placeholder = placeholders[key];
    if (placeholder.required && (!data[key] || String(data[key]).trim() === '')) {
      errors[key] = `${key} es requerido`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Composable para gestionar la configuración de presentación
 */
export const usePresentationConfig = () => {
  const template = ref({ name: '', elements: [] });
  const placeholders = ref({});
  const configData = ref({});
  const viewMode = ref('form'); // 'form' o 'json'
  const isGenerating = ref(false);
  const pdfUrl = ref(null);
  const validationErrors = ref({});

  const placeholdersList = computed(() => Object.values(placeholders.value));

  const extractPlaceholdersFromTemplate = (tmpl) => {
    template.value = tmpl;
    placeholders.value = extractPlaceholders(tmpl);
    configData.value = createEmptyDataObject(placeholders.value);
  };

  const updateConfigData = (key, value) => {
    configData.value[key] = value;
    validationErrors.value[key] = null;
  };

  const setConfigDataBulk = (data) => {
    configData.value = { ...data };
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
    // State
    template,
    placeholders,
    configData,
    viewMode,
    isGenerating,
    pdfUrl,
    validationErrors,

    // Computed
    placeholdersList,

    // Methods
    extractPlaceholdersFromTemplate,
    updateConfigData,
    setConfigDataBulk,
    validate,
    toggleViewMode,
    resetConfig,
  };
};
