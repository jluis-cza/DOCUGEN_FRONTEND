import { computed } from 'vue';

const inferParameterType = (element) => {
  if (element?.type === 'checkbox') return 'boolean';
  if (element?.type === 'date') return 'date';
  if (element?.type === 'image') return 'image';
  if (element?.type === 'qr') return 'qr';
  if (['paragraph', 'list', 'footer'].includes(element?.type)) return 'textarea';
  return 'text';
};

const inferPlaceholderType = (element, field) => {
  if (field === 'text' && element?.type === 'checkbox') return 'text';
  if (field === 'src' && element?.type === 'image') return 'image';
  if (field === 'qrValue' && element?.type === 'qr') return 'qr';
  return inferParameterType(element);
};

export const useTemplateParameters = ({ template, pushHistory }) => {
  const normalizeDynamicParameter = (parameter) => {
    if (!parameter || !parameter.key) return;

    const key = parameter.key.trim().replace(/\s+/g, '_');
    if (!key) return;

    parameter.key = key;
    parameter.label = parameter.label || key;
    parameter.type = parameter.type || 'text';
    parameter.required = Boolean(parameter.required);
    parameter.description = parameter.description || '';
  };

  const replacePlaceholderKey = (value, oldKey, newKey) => {
    if (typeof value !== 'string' || !oldKey) return value;
    const escapedKey = oldKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return value.replace(new RegExp(`\\{\\{\\s*${escapedKey}\\s*\\}\\}`, 'g'), `{{${newKey}}}`);
  };

  const dynamicParameters = computed({
    get: () => {
      const values = Array.isArray(template.value?.metadata?.dynamicParameters)
        ? template.value.metadata.dynamicParameters
        : [];
      return values;
    },
    set: (value) => {
      template.value.metadata = {
        ...(template.value.metadata || {}),
        dynamicParameters: value,
      };
    },
  });

  const buildDynamicKey = (type) => {
    const label = type === 'image' ? 'imagen' : type === 'qr' ? 'qr' : 'param';
    const existingKeys = new Set([
      ...template.value.elements.map((element) => element.placeholderKey),
      ...(template.value.metadata.dynamicParameters || []).map((parameter) => parameter.key),
    ]);
    template.value.elements.forEach((element) => {
      for (const value of [element.text, element.src, element.qrValue]) {
        if (typeof value !== 'string') continue;
        for (const match of value.matchAll(/\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g)) {
          existingKeys.add(match[1]);
        }
      }
    });
    let nextIndex = 1;
    while (existingKeys.has(`${label}${nextIndex}`)) nextIndex += 1;
    return `${label}${nextIndex}`;
  };

  const syncDynamicParametersFromTemplate = () => {
    const source = Array.isArray(template.value?.metadata?.dynamicParameters)
      ? template.value.metadata.dynamicParameters
      : [];
    const map = new Map();
    const referencedKeys = new Set();

    template.value.elements.forEach((element) => {
      if (element.placeholderKey) referencedKeys.add(element.placeholderKey.trim());
      for (const field of ['text', 'src', 'qrValue']) {
        const matches =
          String(element[field] || '').match(/\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g) || [];
        matches.forEach((match) => referencedKeys.add(match.replace(/[{}]/g, '').trim()));
      }
    });

    source.forEach((item) => {
      if (!item?.key) return;
      const key = item.key.trim().replace(/\s+/g, '_');
      if (!key || key === 'page_number') return;
      if (item.source === 'placeholder' && !referencedKeys.has(key)) return;
      map.set(key, {
        ...item,
        key,
        label: item.label || key,
        type: item.type || inferParameterType({ type: item.elementType }),
        required: Boolean(item.required),
      });
    });

    template.value.elements.forEach((element) => {
      if (element.type === 'pageNumber') return;

      const keyFromPlaceholder = (element.placeholderKey || '').trim().replace(/\s+/g, '_');
      if (element.type === 'image' && keyFromPlaceholder && map.has(keyFromPlaceholder)) {
        map.get(keyFromPlaceholder).type = 'image';
      }
      if (keyFromPlaceholder && !map.has(keyFromPlaceholder)) {
        map.set(keyFromPlaceholder, {
          key: keyFromPlaceholder,
          label: keyFromPlaceholder,
          type: inferParameterType(element),
          required: true,
          source: 'placeholder',
        });
      }

      for (const field of ['text', 'src', 'qrValue']) {
        const matches =
          String(element[field] || '').match(/\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g) || [];
        matches.forEach((match) => {
          const key = match.replace(/[{}]/g, '').trim().replace(/\s+/g, '_');
          if (field === 'src' && element.type === 'image' && map.has(key)) {
            map.get(key).type = 'image';
            return;
          }
          if (!key || map.has(key)) return;
          map.set(key, {
            key,
            label: key,
            type: inferPlaceholderType(element, field),
            required: true,
            source: 'placeholder',
          });
        });
      }
    });

    const next = [...map.values()].sort((a, b) => String(a.key).localeCompare(String(b.key)));
    template.value.metadata = {
      ...(template.value.metadata || {}),
      dynamicParameters: next,
    };
  };

  const renameDynamicParameter = (parameter, value) => {
    const previousKey = parameter.key;
    const nextKey = String(value || '')
      .trim()
      .replace(/\s+/g, '_');
    if (!/^[A-Za-z0-9_.-]+$/.test(nextKey) || nextKey === 'page_number') return;
    if (
      template.value.metadata.dynamicParameters.some(
        (item) => item !== parameter && item.key === nextKey
      )
    ) {
      return;
    }

    parameter.key = nextKey;
    normalizeDynamicParameter(parameter);
    const normalizedKey = parameter.key;
    if (previousKey && normalizedKey && previousKey !== normalizedKey) {
      template.value.elements.forEach((element) => {
        if (element.placeholderKey === previousKey) element.placeholderKey = normalizedKey;
        element.text = replacePlaceholderKey(element.text, previousKey, normalizedKey);
        element.src = replacePlaceholderKey(element.src, previousKey, normalizedKey);
        element.qrValue = replacePlaceholderKey(element.qrValue, previousKey, normalizedKey);
      });
    }
    syncDynamicParametersFromTemplate();
    pushHistory();
  };

  const setParameterAllowedValues = (parameter, value) => {
    parameter.allowedValues = String(value || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    pushHistory();
  };

  const removeDynamicParameter = (key) => {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const placeholderPattern = new RegExp(`\\{\\{\\s*${escapedKey}\\s*\\}\\}`, 'g');
    template.value.elements.forEach((element) => {
      if (element.placeholderKey === key) element.placeholderKey = '';
      for (const field of ['text', 'src', 'qrValue']) {
        if (typeof element[field] === 'string') {
          element[field] = element[field].replace(placeholderPattern, '');
        }
      }
    });
    template.value.metadata.dynamicParameters = (
      template.value.metadata.dynamicParameters || []
    ).filter((parameter) => parameter.key !== key);
    syncDynamicParametersFromTemplate();
    pushHistory();
  };

  const addDynamicParameter = () => {
    const current = Array.isArray(template.value.metadata?.dynamicParameters)
      ? template.value.metadata.dynamicParameters
      : [];
    const key = buildDynamicKey('text');
    template.value.metadata = {
      ...(template.value.metadata || {}),
      dynamicParameters: [...current, { key, label: key, type: 'text', required: true }],
    };
    pushHistory();
  };

  return {
    dynamicParameters,
    buildDynamicKey,
    syncDynamicParametersFromTemplate,
    renameDynamicParameter,
    setParameterAllowedValues,
    removeDynamicParameter,
    addDynamicParameter,
  };
};
