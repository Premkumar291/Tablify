import api from './axios';

export const convertPdf = (formData) => api.post('/convert', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob' // Important for file download
});
