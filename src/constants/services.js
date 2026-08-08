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
    base: '/api',
    version: '/v1',
    docugen_web: {
      admission: {
        base: '/adm',
        register_account: '/register',
        start_session: '/login',
        close_session: '/logout',
        renew_access: '/refresh',
        verify_email: '/verify-email',
        verify_password: '/verify-pass',
        check_username: '/check-user',
        get_username: '/get-user',
      },
      administration: {
        base: '/admin',
        monitor: '/monitor',
        configuration: '/config',
        review: '/rev',
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
      management: {
        base: '/manager',
        monitor: '/monitor',
        configuration: '/config', //Rarely used
        count: '/cnt',
        resource: {
          activities: {
            base: '/activities',
            id: '/:activity_id',
          },
          processes: {
            base: '/processes',
            id: '/:process_id',
          },
          notifications: {
            base: '/notifications',
            id: '/:notification_id',
            acknowledgement: '/ack',
            creation: '/create',
          },
          profiles: {
            base: '/profiles',
            id: '/:profile_id',
          },
        },
      },
    },
    docugen_app: {},
    utils: {
      base: '/utils',
      routes: '/info',
      time: '/time',
    },
    lookup: {
      base: '/lookup',
      resource: {
        accounts: {
          base: '/accounts',
        },
        roles: {
          base: '/roles',
          admin: '/admin',
          dev: '/dev',
        },
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
      management: {
        create_notification: {
          to: '',
          from: '',
          subject: '',
          message: '',
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
          isRequested: false,
        },
        data: {
          title: '',
          icon: '',
          text: '',
          parameters: [],
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
