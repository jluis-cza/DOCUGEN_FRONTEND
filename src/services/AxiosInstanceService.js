import axios from 'axios';
import { SERVICES } from '../constants/services';

// Axios instance to make HTTP requests
const axiosInstance = (baseURL = SERVICES.base_url.api, headers = SERVICES.content.type.json) => {
  return axios.create({
    baseURL: baseURL,
    timeout: 30000, //
    headers: {
      ...headers,
    },
  });
};

// Out-Data interceptor
axiosInstance().interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    config.headers.Authorization = 'Bearer ' + (token ? token : '');
    console.log('Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

//In-Data interceptor
axiosInstance().interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    if (error.response) {
      // El servidor respondió con un código de error
      switch (error.response.status) {
        case 401:
          console.error('No autorizado - Redirigir a login');
          localStorage.removeItem('token');
          // router.push('/login');
          break;
        case 404:
          console.error('Recurso no encontrado');
          break;
        case 500:
          console.error('Error del servidor');
          break;
        default:
          console.error('Error:', error.response.status);
      }
    } else if (error.request) {
      console.error('El servidor no respondió a la petición');
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
