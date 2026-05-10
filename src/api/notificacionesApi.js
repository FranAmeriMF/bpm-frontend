import { baseApi } from './baseApi';

export const notificacionesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getNotificaciones: build.query({
      query: (params = {}) => ({ url: '/notificaciones', params }),
      providesTags: [{ type: 'Notificacion', id: 'LIST' }],
    }),

    marcarLeida: build.mutation({
      query: (id) => ({ url: `/notificaciones/${id}/leer`, method: 'PATCH' }),
      invalidatesTags: [{ type: 'Notificacion', id: 'LIST' }],
    }),

    marcarTodasLeidas: build.mutation({
      query: () => ({ url: '/notificaciones/leer-todas', method: 'PATCH' }),
      invalidatesTags: [{ type: 'Notificacion', id: 'LIST' }],
    }),

    deleteNotificacion: build.mutation({
      query: (id) => ({ url: `/notificaciones/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Notificacion', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetNotificacionesQuery,
  useMarcarLeidaMutation,
  useMarcarTodasLeidasMutation,
  useDeleteNotificacionMutation,
} = notificacionesApi;
