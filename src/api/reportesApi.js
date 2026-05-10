import { baseApi } from './baseApi';

export const reportesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getReportesDashboard: build.query({
      query: () => '/reportes/dashboard',
    }),
    getTramitesPorEstado: build.query({
      query: (params = {}) => ({ url: '/reportes/tramites-por-estado', params }),
    }),
    getDesempenoOficinas: build.query({
      query: () => '/reportes/desempeno-oficinas',
    }),
    getDesempenoDecisor: build.query({
      query: () => '/reportes/desempeno-decisor',
    }),
    getReporteEmpresa: build.query({
      query: (id) => `/reportes/empresa/${id}`,
    }),
  }),
});

export const {
  useGetReportesDashboardQuery,
  useGetTramitesPorEstadoQuery,
  useGetDesempenoOficinasQuery,
  useGetDesempenoDecisorQuery,
  useGetReporteEmpresaQuery,
} = reportesApi;
