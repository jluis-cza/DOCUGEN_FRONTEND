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
    },
  },
};
