import { baseApi } from './baseApi';

export const tramitesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTramites: build.query({
      query: (params = {}) => ({ url: '/tramites', params }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Tramite', id })),
              { type: 'Tramite', id: 'LIST' },
            ]
          : [{ type: 'Tramite', id: 'LIST' }],
    }),

    getTramite: build.query({
      query: (id) => `/tramites/${id}`,
      providesTags: (result, error, id) => [{ type: 'Tramite', id }],
    }),

    createTramite: build.mutation({
      query: (body) => ({ url: '/tramites', method: 'POST', body }),
      invalidatesTags: [{ type: 'Tramite', id: 'LIST' }],
    }),

    updateTramite: build.mutation({
      query: ({ id, ...body }) => ({ url: `/tramites/${id}`, method: 'PATCH', body }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Tramite', id },
        { type: 'Tramite', id: 'LIST' },
      ],
    }),

    deleteTramite: build.mutation({
      query: (id) => ({ url: `/tramites/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [
        { type: 'Tramite', id },
        { type: 'Tramite', id: 'LIST' },
      ],
    }),

    // ── Flujo solicitante ──────────────────────────────────────────────────────

    enviarDirector: build.mutation({
      query: (id) => ({ url: `/tramites/${id}/enviar-director`, method: 'POST' }),
      invalidatesTags: (result, error, id) => [{ type: 'Tramite', id }],
    }),

    iniciarCorreccion: build.mutation({
      query: (id) => ({ url: `/tramites/${id}/iniciar-correccion`, method: 'POST' }),
      invalidatesTags: (result, error, id) => [{ type: 'Tramite', id }],
    }),

    reenviarTramite: build.mutation({
      query: ({ id, ...body }) => ({ url: `/tramites/${id}/reenviar`, method: 'POST', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Tramite', id }],
    }),

    // ── Flujo director ─────────────────────────────────────────────────────────

    aprobarDirector: build.mutation({
      query: (id) => ({ url: `/tramites/${id}/aprobar-director`, method: 'POST' }),
      invalidatesTags: (result, error, id) => [{ type: 'Tramite', id }],
    }),

    rechazarDirector: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/tramites/${id}/rechazar-director`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Tramite', id }],
    }),

    // ── Flujo moderador ────────────────────────────────────────────────────────

    asignarTramite: build.mutation({
      query: ({ id, ...body }) => ({ url: `/tramites/${id}/asignar`, method: 'POST', body }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Tramite', id },
        { type: 'Tramite', id: 'LIST' },
      ],
    }),

    // ── Flujo revisores ────────────────────────────────────────────────────────

    iniciarRevision: build.mutation({
      query: (id) => ({ url: `/tramites/${id}/iniciar-revision`, method: 'POST' }),
      invalidatesTags: (result, error, id) => [{ type: 'Tramite', id }],
    }),

    finalizarRevision: build.mutation({
      query: (id) => ({ url: `/tramites/${id}/finalizar-revision`, method: 'POST' }),
      invalidatesTags: (result, error, id) => [{ type: 'Tramite', id }],
    }),

    // ── Estadísticas (dashboard) ───────────────────────────────────────────────

    getEstadisticas: build.query({
      query: () => '/tramites/estadisticas',
      providesTags: [{ type: 'Tramite', id: 'LIST' }],
    }),

    // ── Decisión final (decisor) ───────────────────────────────────────────────

    decisionFinal: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/tramites/${id}/decision-final`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Tramite', id },
        { type: 'Tramite', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetEstadisticasQuery,
  useGetTramitesQuery,
  useGetTramiteQuery,
  useCreateTramiteMutation,
  useUpdateTramiteMutation,
  useDeleteTramiteMutation,
  useEnviarDirectorMutation,
  useIniciarCorreccionMutation,
  useReenviarTramiteMutation,
  useAprobarDirectorMutation,
  useRechazarDirectorMutation,
  useAsignarTramiteMutation,
  useIniciarRevisionMutation,
  useFinalizarRevisionMutation,
  useDecisionFinalMutation,
} = tramitesApi;
