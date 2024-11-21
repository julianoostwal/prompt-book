// api.ts
import axios from 'axios';

// Create an Axios instance with a base URL
const api = axios.create({
  baseURL: 'http://5.253.247.243:8000/', // Replace with your actual base URL
});

// Add a request interceptor to attach the token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // or use context if needed
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
