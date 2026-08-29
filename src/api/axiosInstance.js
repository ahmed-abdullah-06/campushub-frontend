import axios from 'axios';

let baseURL = 'http://localhost:5000/api';

try {
  const metaEnv = new Function('return import.meta.env')();
  if (metaEnv && metaEnv.VITE_API_URL) {
    baseURL = metaEnv.VITE_API_URL;
  }
} catch (e) {
  if (typeof process !== 'undefined' && process.env && process.env.VITE_API_URL) {
    baseURL = process.env.VITE_API_URL;
  }
}

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auto-attach JWT token to requests if present in localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;