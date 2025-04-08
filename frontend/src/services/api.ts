import axios from 'axios';

// For debugging purposes - always log which API URL we're using
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
console.log('🌐 API Configuration:');
console.log(`   API URL: ${API_URL}`);
console.log(`   Mock API: ${import.meta.env.VITE_USE_MOCK_API || 'false'}`);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Increase timeout for potentially slow responses
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log outgoing requests in development
    if (import.meta.env.DEV) {
      console.log(`🔄 Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error.message);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error.message);
    
    if (error.response) {
      if (error.response.status === 401) {
        console.log('🔑 Authentication failure - redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
