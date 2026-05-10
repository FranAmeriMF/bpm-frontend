import { configureStore, isRejectedWithValue } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { baseApi } from '@api/baseApi';
import authReducer from './authSlice';

// Global RTK error handler — shows toast for 5xx, lets components handle 4xx
const rtkErrorMiddleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const status = action.payload?.status;
    if (typeof status === 'number' && status >= 500) {
      toast.error('Error del servidor. Intente nuevamente.');
    }
  }
  return next(action);
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(baseApi.middleware, rtkErrorMiddleware),
});
