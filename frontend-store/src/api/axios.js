import axios from 'axios';
import { getTenantId } from '../utils/tenant';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api', 
});

// Interceptor to inject x-tenant-id (Tenant ID extract cheyyunnu)
api.interceptors.request.use(
    (config) => {
        const tenantId = getTenantId();
        
        if (tenantId) {
            config.headers['x-tenant-id'] = tenantId;
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
