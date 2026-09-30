import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api', // Uses env variable in production, falls back to localhost
});

// Ella requestilum JWT token auto aayi add cheyyan ulla interceptor
api.interceptors.request.use(
    (config) => {
        // Local storage-il ninnu token edukkunnu
        const token = localStorage.getItem('token');
        if (token) {
            // Token undenkil authorization header-il set cheyyum
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - 401 error vannal logout cheyyan
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Unauthorized error (401) vannal token remove cheythu login page-lekku vidum
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = '/auth';
        }
        return Promise.reject(error);
    }
);

export default api;
