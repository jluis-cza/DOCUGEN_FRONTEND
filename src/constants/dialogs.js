// Configuration of data aand metadata to be shown in dialog boxes
import { SERVICES } from './services.js';

// *************************************************************************************************
export const DIALOGS = {
  docugen_web: {
    administration: {
      user_suspension: {
        title: 'Suspención de usuario',
        icon: 'mdi-account-off',
        text: `¿Está seguro de suspender al usuario <username>? El usuario no podrá seguir usando los servicios de DOCUGEN y tampoco podrá ingresar al sistema.`,
        actions: [
          { name: 'Cancelar', key: 'n', color: 'bg-secondary' },
          { name: 'Continuar', key: 'y', color: 'bg-primary' },
        ],
        parameters: [],
      },
      user_service_suspension: {
        title: 'Desactivación del servicio',
        icon: 'mdi-power-off',
        text: `¿Está seguro de poner fuera de servicio la <service> para el usuario <username>?`,
        actions: [
          { name: 'Cancelar', key: 'n', color: 'bg-secondary' },
          { name: 'Aceptar', key: 'y', color: 'bg-primary' },
        ],
        parameters: [],
      },
      general_service_suspension: {
        title: 'Desactivación del servicio',
        icon: 'mdi-power-off',
        text: `¿Está seguro de poner fuera de servicio la <service> de manera global?`,
        actions: [
          { name: 'Cancelar', key: 'n', color: 'bg-secondary' },
          { name: 'Aceptar', key: 'y', color: 'bg-primary' },
        ],
        parameters: [],
      },
    },
    management: {
      set_username: {
        title: 'Cambio de nombre de usuario',
        icon: 'mdi-account-edit',
        text: 'Ingrese su nuevo nombre de usuario  y luego acepte los cambios.',
        actions: [
          { name: 'Cancelar', key: 'n', color: 'bg-secondary' },
          { name: 'Aceptar', key: 'y', color: 'bg-primary' },
        ],
        parameters: [
          {
            key: 'newUsername',
            label: 'Nuevo nombre de usuario',
            info: 'El nombre de usuario debe empezar con una letra. No se permiten puntos, guiones consecutivos. No puede terminar con punto o guión. Debe tener 3-20 carácteres (letras, números, . _ -)',
            valueSet: [],
            unitSet: [],
            ruleSet: ['RULE_TEXT_REQUIRED', 'RULE_USERNAME_INPUT', 'RULE_USERNAME_AVAILABILITY'],
            evaluateOn: 'blur',
            group: 'usernameSet',
            member: '1',
            type: 'text',
            class: 'textfield-1',
            enabled: true,
          },
        ],
      },
      set_password: {
        title: 'Cambio de contraseña',
        icon: 'mdi-lock-reset',
        text: 'Ingrese su contraseña actual luego ingrese su nueva contraseña, reconfirme y acepte los cambios.',
        actions: [
          { name: 'Cancelar', key: 'n', color: 'bg-secondary' },
          { name: 'Aceptar', key: 'y', color: 'bg-primary' },
        ],
        parameters: [
          {
            key: 'currentPass',
            label: 'Contraseña actual',
            info: '',
            valueSet: [],
            unitSet: [],
            ruleSet: ['RULE_TEXT_REQUIRED', 'RULE_PASSWORD_INPUT', 'RULE_PASSWORD_VERIFICATION'],
            evaluateOn: 'blur',
            group: 'passSet',
            member: '1',
            type: 'password',
            class: 'textfield-1',
            enabled: true,
          },
          {
            key: 'newPass',
            label: 'Nueva contraseña',
            info: 'Mínimo 8 carácteres.',
            valueSet: [],
            unitSet: [],
            ruleSet: ['RULE_TEXT_REQUIRED', 'RULE_PASSWORD_INPUT'],
            evaluateOn: 'input',
            group: 'passSet',
            member: '2',
            type: 'password',
            class: 'textfield-1',
            enabled: true,
          },
          {
            key: 'newPassConfirmation',
            label: 'Reingrese la nueva contraseña',
            info: '',
            valueSet: [],
            unitSet: [],
            ruleSet: ['RULE_TEXT_REQUIRED', 'RULE_PASSWORD_MATCH'],
            evaluateOn: 'input',
            group: 'passSet',
            member: '3',
            type: 'password',
            class: 'textfield-1',
            enabled: false,
          },
        ],
      },
    },
  },
  default: SERVICES.payload.utils.dialog_box.data,
};
