import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from '@store/authSlice';

const rawBase = fetchBaseQuery({ baseUrl: '/api' });

const baseQueryWith401 = async (args, api, extraOptions) => {
  const token = api.getState().auth.token;
  const adjustedArgs = typeof args === 'string'
    ? { url: args, headers: token ? { Authorization: `Bearer ${token}` } : {} }
    : {
        ...args,
        headers: {
          ...(args.headers ?? {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      };
  const result = await rawBase(adjustedArgs, api, extraOptions);
  if (result.error?.status === 401) api.dispatch(logout());
  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWith401,
  tagTypes: ['Tramite', 'Notificacion', 'Usuario', 'Empresa', 'Oficina', 'Plantilla', 'TipoTramite', 'Me', 'OficinaEmpresa'],
  endpoints: () => ({}),
});
