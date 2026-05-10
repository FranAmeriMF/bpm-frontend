import { baseApi } from './baseApi';

export const evaluacionesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProgreso: build.query({
      query: (asignacion_id) => `/evaluaciones/asignacion/${asignacion_id}/progreso`,
      providesTags: (result, error, asignacion_id) => [
        { type: 'Tramite', id: asignacion_id },
      ],
    }),

    // body: { asignacion_oficina_id, seccion_id, aprobada, motivo_rechazo?, evaluado_por }
    evaluarSeccion: build.mutation({
      query: (body) => ({ url: '/evaluaciones/seccion', method: 'POST', body }),
      invalidatesTags: (result, error, { asignacion_oficina_id }) => [
        { type: 'Tramite', id: asignacion_oficina_id },
      ],
    }),
  }),
});

export const { useGetProgresoQuery, useEvaluarSeccionMutation } = evaluacionesApi;
