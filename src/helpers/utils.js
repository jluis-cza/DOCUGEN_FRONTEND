// General helpers
// deep merging
//  Merge objects
export const deepMerge = (target, source) => {
  const result = structuredClone(target); // Copia profunda del target
  for (const key in source) {
    if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] ?? {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
};
// Normalize text
// It removes and / or transforms text for urls
export const toSlug = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD') // descompone caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // elimina los diacríticos (tildes)
    .replace(/[^a-z0-9-]/g, '-') // reemplaza caracteres inválidos por -
    .replace(/-+/g, '-') // colapsa guiones múltiples
    .replace(/^-|-$/g, ''); // elimina guiones al inicio y al final
};
// Normalize dates
// It transforms iso 8601 dates to a legible format
export const normalizeDate = (date) => {
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};
