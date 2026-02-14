//  Rules to make validations in frontend

// Text Fields
export const RULES = {
  text: {
    input: {
      // Empty text values
      required: (value) => {
        return value ? true : 'Sin entrada.';
      },
      // Non-valid email address
      email: (value) => {
        if (value) {
          const isValidFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
          return isValidFormat || 'Correo no válido.';
        } else {
          return 'Sin entrada.';
        }
      },
      // Matching two references
      match: (getReferenceValue, pluralReferenceName) => {
        return (value) => {
          return value === getReferenceValue() ? true : `${pluralReferenceName} son distintas.`;
        };
      },
      // Testing username validity
      username: (value) => {
        if (value) {
          const isValidFormat = /^[a-zA-Z](?!.*[._-]{2})[a-zA-Z0-9._-]{2,18}[a-zA-Z0-9]$/.test(
            value
          );
          return isValidFormat || 'Nombre de usuario no válido.';
        } else {
          return 'Sin entrada.';
        }
      },
      // Password rule
      password: (value) => {
        if (value) {
          const isValidPassword =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/.test(value);
          return isValidPassword || 'Contraseña no válida.';
        } else {
          return 'Sin entrada.';
        }
      },
    },
  },
};
