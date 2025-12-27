import axios from 'axios';
import { SERVICES } from '../constants/services.js';
import { useTokenStore } from '../stores/docugen-web/tokenStore.js';

const ROOT_API_URL = SERVICES.base_url.api;
const JSON_CONTENT_TYPE = SERVICES.content.type.json;

// Axios instance to make HTTP requests
const axiosInstance = axios.create({
  baseURL: ROOT_API_URL,
  timeout: 30000, //
  headers: {
    ...JSON_CONTENT_TYPE,
  },
  withCredentials: true, // For sending and receiving cookies
});

// Refresh process variables
let isRefreshing = false;
let failedRequestsQueue = [];

// Out-Data interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const tokenStore = useTokenStore();
    const token = tokenStore.getToken || '';
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Process failed requests
const processQueue = (error, token = null) => {
  failedRequestsQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedRequestsQueue = [];
};

//In-Data interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.config.url);
    console.log('Response Data:', response.data);
    alert(response.data.message);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 Status response treatment
    if (error.response?.status === 401 && !originalRequest._retry) {

      // If the instance is refreshing add current request to the queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Avoiding infinite loops
      originalRequest._retry = true;
      isRefreshing = true;

      const tokenStore = useTokenStore();

      try {
        // Renew token
        await tokenStore.renewToken();
        // const newToken = response.data.accessToken;
        const newToken = tokenStore.getToken || '';
        originalRequest.headers.Authorization = `Bearer ${newToken}`; // Update token bearer
        processQueue(null, newToken);  // Process requests

        return axiosInstance(originalRequest); // Retry request
      } catch (refreshError) {
        
        processQueue(refreshError, null); // If error happens add error to the queue

        // Clean token info
        tokenStore.resetToken();
        tokenStore.resetInfo();

        // Redirigir al login (descomenta si usas vue-router)
        // import router from '@/router';
        // router.push('/login');

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response) {
      // El servidor respondió con un código de error
      switch (error.response.status) {
        case 404:
          console.error('Recurso no encontrado');
          break;
        case 500:
          console.error('Error del servidor');
          break;
        default:
          console.error('Error:', error.response.status);
      }
      console.error('Detalles del error:', error.response.data);
      if (error.response.data?.message) {
        alert(error.response.data.message);
      }
    } else if (error.request) {
      console.error('El servidor no respondió a la petición');
    } else {
      console.error('Error:', error.message);
    }
    // alert(error.response.data.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
