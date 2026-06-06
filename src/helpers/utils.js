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

// FORMATEAR LA FECHA
//extractTime, extractTime2, fecha2, fecha3 ; fecha1: EJ:01/05/2020---->1 de mayo del 2020
// Conversión de hour UTC a 'dateZone'
// Example: item = extractTime(item, 'America/La_Paz', 'short').date
//Ejemplo: entrada: 2024-01-16T22:13:22.000000Z; salida: {date: "16/1/2024", hour: " 22:13:22"}  para numeric
//Ejemplo: entrada: 2024-01-16T22:13:22.000000Z; salida: {date: "16 de enero de 2024", hour: " 22:13:22"} para long
//Ejemplo: entrada: 2024-01-16T22:13:22.000000Z; salida: {date: "16 ene 2024", hour: " 22:13:22"} paa short
//Si se omite la parte despues de 'T' en la entrada, la hora de salida es 00:00:00
export const extractTime = (utcDate, dateZone = 'America/La_Paz', format = 'numeric') => {
  const options = {
    timeZone: `${dateZone}`,
    year: 'numeric',
    month: `${format}` === 'numeric' ? '2-digit' : `${format}` === 'short2' ? 'short' : format,
    day: `${format}` === 'numeric' || `${format}` === 'short2' ? '2-digit' : 'numeric',
    hour: `${format}` === 'numeric' || `${format}` === 'short2' ? '2-digit' : 'numeric',
    minute: `${format}` === 'numeric' || `${format}` === 'short2' ? '2-digit' : 'numeric',
    second: 'numeric',
  };
  if (utcDate) {
    const dateOut = new Date(utcDate).toLocaleString('es', options).split(',');
    return dateOut
      ? {
          date: dateOut[0],
          hour: dateOut[1],
        }
      : ' ';
  } else {
    return { date: '', hour: '' };
  }
};
