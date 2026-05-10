import axios from 'axios';
import { store } from '@store/index';
import { logout } from '@store/authSlice';

const client = axios.create({ baseURL: '/api' });

client.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      store.dispatch(logout());
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export default client;
