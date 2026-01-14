export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ROUTES = {
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    CONVERT: '/dashboard/convert',
    API_KEYS: '/dashboard/api-keys',
    USAGE: '/dashboard/usage',
    BILLING: '/dashboard/billing',
};

export const PLANS = {
    FREE: 'FREE',
    LOCKED: 'LOCKED',
    PREMIUM: 'PREMIUM',
};
