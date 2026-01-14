import api from './axios';

export const generateApiKey = (name) => api.post('/auth/api-keys', { name });
export const getApiKeys = () => api.get('/auth/api-keys');
