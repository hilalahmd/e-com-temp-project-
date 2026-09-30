import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api', 
});

// Interceptor to inject x-tenant-id
api.interceptors.request.use(
    (config) => {
        const urlParams = new URLSearchParams(window.location.search);
        const tenantId = urlParams.get('store');
        
        if (tenantId) {
            config.headers['x-tenant-id'] = tenantId;
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
