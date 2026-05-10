import { baseApi } from './baseApi';

export const usuariosApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUsuarios: build.query({
      query: (params = {}) => ({ url: '/users', params }),
      providesTags: [{ type: 'Usuario', id: 'LIST' }],
    }),

    getUsuario: build.query({
      query: (id) => `/users/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Usuario', id }],
    }),

    createUsuario: build.mutation({
      query: (body) => ({ url: '/users', method: 'POST', body }),
      invalidatesTags: [{ type: 'Usuario', id: 'LIST' }],
    }),

    updateUsuario: build.mutation({
      query: ({ id, ...body }) => ({ url: `/users/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Usuario', id }, { type: 'Usuario', id: 'LIST' }],
    }),

    changeStatusUsuario: build.mutation({
      query: ({ id, estado }) => ({ url: `/users/${id}/estado?estado=${estado}`, method: 'PATCH' }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Usuario', id }, { type: 'Usuario', id: 'LIST' }],
    }),

    deleteUsuario: build.mutation({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Usuario', id: 'LIST' }],
    }),

    resetPasswordUsuario: build.mutation({
      query: (id) => ({ url: `/users/${id}/reset-password`, method: 'POST' }),
    }),
  }),
});

export const {
  useGetUsuariosQuery,
  useGetUsuarioQuery,
  useCreateUsuarioMutation,
  useUpdateUsuarioMutation,
  useChangeStatusUsuarioMutation,
  useDeleteUsuarioMutation,
  useResetPasswordUsuarioMutation,
} = usuariosApi;
