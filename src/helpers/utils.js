// *************************************************************************************************
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
// export const extractTime = (utcDate, dateZone = 'America/La_Paz', format = 'numeric') => {
//   const options = {
//     timeZone: `${dateZone}`,
//     year: 'numeric',
//     month: `${format}` === 'numeric' ? '2-digit' : `${format}` === 'short2' ? 'short' : format,
//     day: `${format}` === 'numeric' || `${format}` === 'short2' ? '2-digit' : 'numeric',
//     hour: `${format}` === 'numeric' || `${format}` === 'short2' ? '2-digit' : 'numeric',
//     minute: `${format}` === 'numeric' || `${format}` === 'short2' ? '2-digit' : 'numeric',
//     second: 'numeric',
//   };
//   if (utcDate) {
//     const dateObj =  new Date(utcDate)
//     const dateOut =dateObj.toLocaleDateString('es', options).split(',');
//     console.log({dateOut})
//     return dateOut
//       ? {
//           date: dateOut[0],
//           hour: dateOut[1],
//         }
//       : ' ';
//   } else {
//     return { date: '', hour: '' };
//   }
// };

export const extractTime = (utcDate, dateZone = 'America/La_Paz', format = 'numeric') => {
  if (!utcDate) return { date: '', hour: '' };

  const dateObj = new Date(utcDate);
  const options = {
    timeZone: dateZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };

  if (format === 'numeric') {
    options.year = 'numeric';
    options.month = '2-digit';
    options.day = '2-digit';
  } else if (format === 'short2') {
    options.year = 'numeric';
    options.month = 'short';
    options.day = '2-digit';
  } else {
    options.year = 'numeric';
    options.month = format; // 'short' o 'long'
    options.day = 'numeric';
  }

  const formattedString = dateObj.toLocaleString('es-BO', options);

  // Hour split
  const timeRegex = /(\d{1,2}:\d{2}:\d{2})/;
  const match = formattedString.split(timeRegex);

  if (match && match.length >= 2) {
    let cleanDate = match[0].trim();

    // cleaning undesirable suffixes
    cleanDate = cleanDate
      .replace(/,$/, '') // Quita comas al final
      .replace(/\s+a\s+las$/, '') // Quita " a las" al final
      .replace(/\s+de\s+las$/, '') // Por si acaso, quita " de las"
      .trim();

    return {
      date: cleanDate,
      hour: match[1].trim(),
    };
  }

  return { date: formattedString, hour: '' };
};

// SUBARRAY EXTRACTOR
// Selects a specific subarray of an array given the size(number of elements) and the offset(index of the first element)
export const extractSubarray = (array, offset, size) => {
  const a = offset;
  const b = offset + size;
  const subarray = array.slice(a, b);
  return subarray;
};

// Smooth scroll
//  it accepts a reference to ana element of DOM and when invoked scrolls there
export const scroll = (reference) => {
  const scrollElement = reference?.$el || null;
  if (scrollElement) {
    scrollElement.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
};
