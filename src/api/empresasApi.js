import { baseApi } from './baseApi';

export const empresasApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getEmpresas: build.query({
      query: (params = {}) => ({ url: '/empresas', params }),
      providesTags: [{ type: 'Empresa', id: 'LIST' }],
    }),

    getEmpresa: build.query({
      query: (id) => `/empresas/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Empresa', id }],
    }),

    createEmpresa: build.mutation({
      query: (body) => ({ url: '/empresas', method: 'POST', body }),
      invalidatesTags: [{ type: 'Empresa', id: 'LIST' }],
    }),

    updateEmpresa: build.mutation({
      query: ({ id, ...body }) => ({ url: `/empresas/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Empresa', id }, { type: 'Empresa', id: 'LIST' }],
    }),

    changeStatusEmpresa: build.mutation({
      query: ({ id, estado }) => ({ url: `/empresas/${id}/estado?estado=${estado}`, method: 'PATCH' }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Empresa', id }, { type: 'Empresa', id: 'LIST' }],
    }),

    deleteEmpresa: build.mutation({
      query: (id) => ({ url: `/empresas/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Empresa', id: 'LIST' }],
    }),

    getEmpresaUsuarios: build.query({
      query: (id) => `/empresas/${id}/usuarios`,
      providesTags: (_r, _e, id) => [{ type: 'Empresa', id }],
    }),

    getEmpresaStats: build.query({
      query: (id) => `/empresas/${id}/estadisticas`,
      providesTags: (_r, _e, id) => [{ type: 'Empresa', id }],
    }),
  }),
});

export const {
  useGetEmpresasQuery,
  useGetEmpresaQuery,
  useCreateEmpresaMutation,
  useUpdateEmpresaMutation,
  useChangeStatusEmpresaMutation,
  useDeleteEmpresaMutation,
  useGetEmpresaUsuariosQuery,
  useGetEmpresaStatsQuery,
} = empresasApi;
