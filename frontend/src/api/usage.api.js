import api from './axios';

export const getUserStats = () => api.get('/admin/stats'); // If valid for user? Backend check...
// Actually backend limit check is in conversion/middleware.
// We might need an endpoint to get current usage if we want to show it.
// The backend prompt didn't specify a "get my usage" endpoint for users, only admin stats.
// But we can infer usage from limits errors or maybe add one.
// For now, we will handle usage limits via error handling (403).
