import api from './axios';

export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (email, password, name) => api.post('/auth/register', { email, password, name });
export const refreshToken = (token) => api.post('/auth/refresh-token', { token });
