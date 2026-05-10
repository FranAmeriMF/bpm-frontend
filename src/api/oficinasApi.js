import { baseApi } from './baseApi';

export const oficinasApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOficinas: build.query({
      query: (params = {}) => ({ url: '/oficinas', params }),
      providesTags: [{ type: 'Oficina', id: 'LIST' }],
    }),

    getOficina: build.query({
      query: (id) => `/oficinas/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Oficina', id }],
    }),

    createOficina: build.mutation({
      query: (body) => ({ url: '/oficinas', method: 'POST', body }),
      invalidatesTags: [{ type: 'Oficina', id: 'LIST' }],
    }),

    updateOficina: build.mutation({
      query: ({ id, ...body }) => ({ url: `/oficinas/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Oficina', id }, { type: 'Oficina', id: 'LIST' }],
    }),

    deleteOficina: build.mutation({
      query: (id) => ({ url: `/oficinas/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Oficina', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetOficinasQuery,
  useGetOficinaQuery,
  useCreateOficinaMutation,
  useUpdateOficinaMutation,
  useDeleteOficinaMutation,
} = oficinasApi;
