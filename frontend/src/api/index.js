import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
});

export const getBooks = (params) => api.get('/books', { params }).then((r) => r.data);
export const getBook = (id) => api.get(`/books/${id}`).then((r) => r.data);
export const getCategories = () => api.get('/books/categories').then((r) => r.data);
export const createBook = (payload) => api.post('/books', payload).then((r) => r.data);

export const getMembers = () => api.get('/members').then((r) => r.data);
export const createMember = (payload) => api.post('/members', payload).then((r) => r.data);

export const getLoans = (params) => api.get('/loans', { params }).then((r) => r.data);
export const borrowBook = (payload) => api.post('/loans', payload).then((r) => r.data);
export const returnLoan = (id) => api.post(`/loans/${id}/return`).then((r) => r.data);

export default api;
