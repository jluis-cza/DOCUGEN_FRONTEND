//  Rules to make validations in frontend
import { useUsername } from '../composables/docugen-web/useUsername.js';
import { useMyPassword } from '../composables/docugen-web/useMyPassword.js';

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
          const isValidFormat = /^[a-zA-Z](?!.*[._-]{2})[a-zA-Z0-9._-]{1,18}[a-zA-Z0-9]$/.test(
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
          const isValidPassword = /^.{8,}$/.test(value)
          // const isValidPassword =
          //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/.test(value);
          return isValidPassword || 'Contraseña no válida.';
        } else {
          return 'Sin entrada.';
        }
      },
      usernameAvailability: async (value) => {
        if (!value) return 'Sin entrada';
        const {
          username,
          actions,
          success,
        } = useUsername();
        await actions.usernameChecker({ data: { username: value } });
        if (success.value) {
          return (
            username.value.metadata.username.isAvailable ||
            'El nombre de usuario no está disponible, por favor elija otro.'
          );
        } else {
          return 'Error en la consulta';
        }
      },
      passwordVerification: async (value) => {
        if (!value) return 'Sin entrada';
        const {
          myPassword,
          actions,
          success,
        } = useMyPassword();
        await actions.passwordVerifier({ data: { password: value } });
        if (success.value) {
          return (
            myPassword.value.metadata.password.passedVerification ||
            'La contraseña ingresada no es correcta.'
          );
        } else {
          return 'Error en la consulta';
        }
      },
    },
  },
};
