import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Assume refresh token is stored in cookie or we just redirect to login for now since backend setup was simple
                // Backend has refresh token endpoint, but for simplicity in this turn, I'll clear storage and redirect
                // Ideally we call /refresh-token

                // For this version:
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';

            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
