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
