import axios from 'axios';

// Vite statically replaces `import.meta.env.VITE_API_URL` at build time and
// provides it in dev. Falls back to the local backend when unset (e.g. tests).
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
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
