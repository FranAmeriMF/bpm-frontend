import { baseApi } from './baseApi';

export const plantillasApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPlantillas: build.query({
      query: (params = {}) => ({ url: '/plantillas-mensaje', params }),
      providesTags: ['Plantilla'],
    }),
    getPlantilla: build.query({
      query: (id) => `/plantillas-mensaje/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Plantilla', id }],
    }),
    createPlantilla: build.mutation({
      query: (body) => ({ url: '/plantillas-mensaje', method: 'POST', body }),
      invalidatesTags: ['Plantilla'],
    }),
    updatePlantilla: build.mutation({
      query: ({ id, ...body }) => ({ url: `/plantillas-mensaje/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => ['Plantilla', { type: 'Plantilla', id }],
    }),
    deletePlantilla: build.mutation({
      query: (id) => ({ url: `/plantillas-mensaje/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Plantilla'],
    }),
  }),
});

export const {
  useGetPlantillasQuery,
  useGetPlantillaQuery,
  useCreatePlantillaMutation,
  useUpdatePlantillaMutation,
  useDeletePlantillaMutation,
} = plantillasApi;
