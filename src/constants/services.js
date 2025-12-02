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
        base: '/auth',
        register_account: '/register',
        start_session: '/login',
      },
    },
    default: '/',
  },
  payload: {
    docugen_app: {},
    docugen_web: {
      admission: {
        account: {
          username: '',
          user: {
            name: '',
            lastname: '',
            email: '',
          },
          services: [],
          password: '',
          role: '',
          status: '',
        },
        user_credentials:{
          username: '',
          email: '',
          password: '',
        }
      },
    },
    default: {},
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
