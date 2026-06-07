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
        home: '/home',
        base: '/admin',
        monitor: '/monitor',
        configuration: '/config',
        lookup: '/categories',
        resource: {
          system_parameters: {
            base: '/system',
            id: '/:system_parameter_id',
          },
          accounts: {
            base: '/accounts',
            id: '/:account_id',
            resource: {
              sessions: {
                base: '/sessions',
                id: '/:session_id',
              },
            },
          },
          services: {
            base: '/services',
            id: '/:service_id',
          },
        },
      },
      utils: {
        default: '/',
        health: '/health',
      },
    },
    docugen_app: {},
    utils: {
      time: '/time',
      notifications: {
        base: '/notifications',
        id: '/:notification_id',
      },
      activities: {
        base: '/activities',
        id: '/:activity',
      },
    },
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
    utils: {
      // Frontend resources
      notification: {
        message: '',
        code: '',
        mode: '', // persistent or else
      },
      dialog_box: {
        metadata: {
          isResolved: null,
          isRequested: false,
          isShowing: false,
        },
        data: {
          title: '',
          icon: '',
          text: '',
          actions: [],
        },
      },
      // Backend resourses
      time: '', //ISO UTC time
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
