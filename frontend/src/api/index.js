import axios from 'axios';
import { auth } from '../store/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
});

api.interceptors.request.use((config) => {
  if (auth.state.token) {
    config.headers.Authorization = `Bearer ${auth.state.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      auth.logout();
    }
    return Promise.reject(err);
  },
);

// Auth
export const login = (payload) => api.post('/auth/login', payload).then((r) => r.data);
export const register = (payload) => api.post('/auth/register', payload).then((r) => r.data);

// Books
export const getBooks = (params) => api.get('/books', { params }).then((r) => r.data);
export const getBook = (id) => api.get(`/books/${id}`).then((r) => r.data);
export const getCategories = () => api.get('/books/categories').then((r) => r.data);
export const createBook = (payload) => api.post('/books', payload).then((r) => r.data);

// Members
export const getMembers = () => api.get('/members').then((r) => r.data);
export const createMember = (payload) => api.post('/members', payload).then((r) => r.data);

// Loans
export const getLoans = (params) => api.get('/loans', { params }).then((r) => r.data);
export const borrowBook = (payload) => api.post('/loans', payload).then((r) => r.data);
export const returnLoan = (id) => api.post(`/loans/${id}/return`).then((r) => r.data);

export default api;
