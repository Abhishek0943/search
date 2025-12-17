import axios from 'axios';
// import { getUserData } from '../utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showError } from '../utils/helperFunctions';
const API_BASE_URL = 'https://dev.loopin.org/api/v1/';
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5 * 60 * 1000,
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(async config => {
  //   const userData = await getUserData();
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor
axiosInstance.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    if (error.code === 'ECONNABORTED') {
      showError("Request timed out");
    }
    if (error?.response?.status === 401) {
    }
    return Promise.reject(error);
  },
);

// Reusable API Methods
export const apiClient = {
  get: <T = any,>(url: string, params?: any): Promise<T> =>
    axiosInstance.get<T>(url, { params }).then(res => res.data),

  post: <T = any,>(url: string, data?: any): Promise<T> =>
    axiosInstance.post<T>(url, data).then(res => res.data),

  put: <T = any,>(url: string, data?: any): Promise<T> =>
    axiosInstance.put<T>(url, data).then(res => res.data),

  patch: <T = any,>(url: string, data?: any): Promise<T> =>
    axiosInstance.patch<T>(url, data).then(res => res.data),

  delete: <T = any,>(url: string): Promise<T> =>
    axiosInstance.delete<T>(url).then(res => res.data),
};

export default axiosInstance;
