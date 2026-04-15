//HTTP services related constant center
export const SERVICES = {
  base_url: {
    api: import.meta.env.VITE_BASE_URL + '/api',
    stg: import.meta.env.VITE_BASE_URL + '/storage',
  },
  content: {
    type: {
      json: { 'Content-Type': 'application/json' },
      fdata: { 'Content-Type': 'multipart/form-data' },
    },
  },
  path: {
    docugen_app: {},
    docugen_web: {
      admission: {
        base: '/adm',
        register_account: '/register',
        start_session: '/login',
        close_session: '/logout',
        renew_access: '/refresh',
        verify_email: '/verify-email',
      },
      administration: {
        base: '/admin',
        monitor: '/monitor',
        configuration: '/config',
        resource: {
          system_parameters: {
            base: '/system',
            id: '/:system-parameter-id',
          },
          accounts: {
            base: '/accounts',
            id: '/:account-id',
          },
          services: {
            base: '/services',
            id: '/:service-id',
          },
        },
      },
    },
    default: '/',
  },
  payload: {
    docugen_app: {},
    docugen_web: {
      admission: {
        register_account: {
          username: '',
          user: {
            name: '',
            lastname: '',
            email: '',
          },
          password: '',
        },
        start_session: {
          username: '',
          user: {
            email: '',
          },
          password: '',
        },
      },
    },
    general: {
      notification: {
        message: '',
        code: '',
        mode: '', // persistent or else
      },
    },
  },
  params: {
    query: {
      default: {},
    },
    url: {
      default: [],
    },
  },
};
