import axios from 'axios';
import { SERVICES } from '../constants/services.js';
import { useTokenStore } from '../stores/docugen-web/tokenStore.js';
import { accessRenewer, accessRemover } from '../helpers/docugen-web/admissionAccessHelper.js';
import router from '../router/index.js';

const ROOT_API_URL = SERVICES.base_url.api;
const JSON_CONTENT_TYPE = SERVICES.content.type.json;
const timeout = 60000;

// Axios instance to make HTTP requests
export const axiosInstance = axios.create({
  baseURL: ROOT_API_URL,
  timeout: timeout,
  headers: {
    ...JSON_CONTENT_TYPE,
  },
  withCredentials: true, // For sending and receiving cookies
});

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

// Refresh process variables
let isRefreshing = false;
let failedRequestsQueue = [];

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
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest.url.includes(SERVICES.path.docugen_web.admission.base + '/')) {
      // 401 status treatment - Authenticated endpoints
      if (error.response?.status === 401 && !originalRequest._retry) {
        console.error('Not authenticated.');
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

        try {
          await accessRenewer(); // Renew access
          // Update token bearer
          const tokenStore = useTokenStore();
          const newToken = tokenStore.getToken || '';
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          processQueue(null, newToken); // Process requests
          return axiosInstance(originalRequest); // Retry request
        } catch (refreshError) {
          console.error('Error on renewing token.', error.message);
          processQueue(refreshError, null); // If error happens add error to the queue
          accessRemover(); // Clear access info
          router.push('/login'); // login redirect
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }

    if (error.response) {
      switch (error.response.status) {
        case 400:
          console.error('Error: Bad request');
          break;
        case 401:
          console.error('Error: Unauthorized');
          break;
        case 403:
          console.error('Error: Forbidden');
          break;
        case 404:
          console.error('Error: Not found.');
          break;
        case 408:
          console.error('Error: Request timeout.');
          break;
        case 429:
          console.error('Error: Too many requests.');
          break;
        case 500:
          console.error('Error: Internal server Error.');
          break;
        default:
          console.error('Error:', error.response.status);
      }
      console.error('Error details:', error.response.data);
    } else if (error.request) {
      console.error('Error: The server did not respond.');
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);
