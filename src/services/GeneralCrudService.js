// // Defines the generic HTTP methods
// import axiosInstance from './AxiosInstanceService';
// import { SERVICES } from '../constants/services';

// export const generalCrudService = (path = SERVICES.path.default) => {
//   const methods = {
//     read: (params = SERVICES.params.query.default) => {
//       axiosInstance().get(path, { params: params });
//     },
//     create: (
//       payload = SERVICES.payload.default,
//       base_url = SERVICES.base_url.api,
//       content = SERVICES.content.type.json
//     ) => {
//       axiosInstance(base_url, content).post(path, payload);
//     },
//     update: (payload = SERVICES.payload.default) => {
//       axiosInstance().put(path, payload);
//     },
//     delete: () => {axiosInstance().delete(path);},
//   };

//   return methods;
// };

