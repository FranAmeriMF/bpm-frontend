import { baseApi } from './baseApi';

export const oficinasEmpresaApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOficinasEmpresa: build.query({
      query: (empresa_id) => `/empresas/${empresa_id}/oficinas`,
      providesTags: (_r, _e, empresa_id) => [{ type: 'OficinaEmpresa', id: empresa_id }],
    }),

    getOficinaEmpresa: build.query({
      query: ({ empresa_id, id }) => `/empresas/${empresa_id}/oficinas/${id}`,
      providesTags: (_r, _e, { id }) => [{ type: 'OficinaEmpresa', id }],
    }),

    createOficinaEmpresa: build.mutation({
      query: ({ empresa_id, ...body }) => ({
        url: `/empresas/${empresa_id}/oficinas`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { empresa_id }) => [{ type: 'OficinaEmpresa', id: empresa_id }],
    }),

    updateOficinaEmpresa: build.mutation({
      query: ({ empresa_id, id, ...body }) => ({
        url: `/empresas/${empresa_id}/oficinas/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, { empresa_id, id }) => [
        { type: 'OficinaEmpresa', id: empresa_id },
        { type: 'OficinaEmpresa', id },
      ],
    }),

    deleteOficinaEmpresa: build.mutation({
      query: ({ empresa_id, id }) => ({
        url: `/empresas/${empresa_id}/oficinas/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { empresa_id }) => [{ type: 'OficinaEmpresa', id: empresa_id }],
    }),

    asignarUsuarioOficina: build.mutation({
      query: ({ empresa_id, id, usuario_id }) => ({
        url: `/empresas/${empresa_id}/oficinas/${id}/usuarios/${usuario_id}`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, { empresa_id, id }) => [
        { type: 'OficinaEmpresa', id },
        { type: 'OficinaEmpresa', id: empresa_id },
      ],
    }),

    desasignarUsuarioOficina: build.mutation({
      query: ({ empresa_id, id, usuario_id }) => ({
        url: `/empresas/${empresa_id}/oficinas/${id}/usuarios/${usuario_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { empresa_id, id }) => [
        { type: 'OficinaEmpresa', id },
        { type: 'OficinaEmpresa', id: empresa_id },
      ],
    }),
  }),
});

export const {
  useGetOficinasEmpresaQuery,
  useGetOficinaEmpresaQuery,
  useCreateOficinaEmpresaMutation,
  useUpdateOficinaEmpresaMutation,
  useDeleteOficinaEmpresaMutation,
  useAsignarUsuarioOficinaMutation,
  useDesasignarUsuarioOficinaMutation,
} = oficinasEmpresaApi;
