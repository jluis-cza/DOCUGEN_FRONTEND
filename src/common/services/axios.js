import axios from 'axios';

// Instance
const axiosInstance = (baseURL = import.meta.env.VITE_API_URL, headers = {}) => {
  return axios.create({
    baseURL: baseURL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
  });
};

// // Interceptors
// axios.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('authToken');
//     config.headers.Authorization = 'Bearer ' + (token ? token : '');
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );
// axios.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

export default axiosInstance;
