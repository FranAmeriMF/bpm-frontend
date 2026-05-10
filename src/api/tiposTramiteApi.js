import { baseApi } from './baseApi';

export const tiposTramiteApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ── List & Get ───────────────────────────────────────────────────────
    getTiposTramite: build.query({
      query: (params = {}) => ({ url: '/tipos-tramite', params }),
      providesTags: ['TipoTramite'],
    }),
    getTipoTramite: build.query({
      query: (id) => `/tipos-tramite/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'TipoTramite', id }],
    }),

    // ── Tipo CRUD ────────────────────────────────────────────────────────
    createTipoTramite: build.mutation({
      query: (body) => ({ url: '/tipos-tramite', method: 'POST', body }),
      invalidatesTags: ['TipoTramite'],
    }),
    updateTipoTramite: build.mutation({
      query: ({ id, ...body }) => ({ url: `/tipos-tramite/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => ['TipoTramite', { type: 'TipoTramite', id }],
    }),
    deleteTipoTramite: build.mutation({
      query: (id) => ({ url: `/tipos-tramite/${id}`, method: 'DELETE' }),
      invalidatesTags: ['TipoTramite'],
    }),
    activarTipoTramite: build.mutation({
      query: (id) => ({ url: `/tipos-tramite/${id}/activar`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => ['TipoTramite', { type: 'TipoTramite', id }],
    }),
    nuevaVersionTipoTramite: build.mutation({
      query: (id) => ({ url: `/tipos-tramite/${id}/nueva-version`, method: 'POST' }),
      invalidatesTags: ['TipoTramite'],
    }),
    setModoAsignacion: build.mutation({
      query: ({ id, ...body }) => ({ url: `/tipos-tramite/${id}/asignacion`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'TipoTramite', id }],
    }),

    // ── Secciones ────────────────────────────────────────────────────────
    createSeccion: build.mutation({
      query: ({ tipoId, ...body }) => ({ url: `/tipos-tramite/${tipoId}/secciones`, method: 'POST', body }),
      invalidatesTags: (_r, _e, { tipoId }) => [{ type: 'TipoTramite', id: tipoId }],
    }),
    updateSeccion: build.mutation({
      query: ({ tipoId, seccionId, ...body }) => ({ url: `/tipos-tramite/${tipoId}/secciones/${seccionId}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { tipoId }) => [{ type: 'TipoTramite', id: tipoId }],
    }),
    deleteSeccion: build.mutation({
      query: ({ tipoId, seccionId }) => ({ url: `/tipos-tramite/${tipoId}/secciones/${seccionId}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, { tipoId }) => [{ type: 'TipoTramite', id: tipoId }],
    }),
    reorderSecciones: build.mutation({
      query: ({ tipoId, ids }) => ({ url: `/tipos-tramite/${tipoId}/secciones/reorder`, method: 'PATCH', body: { ids } }),
      invalidatesTags: (_r, _e, { tipoId }) => [{ type: 'TipoTramite', id: tipoId }],
    }),

    // ── Campos ───────────────────────────────────────────────────────────
    createCampo: build.mutation({
      query: ({ tipoId, seccionId, ...body }) => ({ url: `/tipos-tramite/${tipoId}/secciones/${seccionId}/campos`, method: 'POST', body }),
      invalidatesTags: (_r, _e, { tipoId }) => [{ type: 'TipoTramite', id: tipoId }],
    }),
    updateCampo: build.mutation({
      query: ({ tipoId, seccionId, campoId, ...body }) => ({ url: `/tipos-tramite/${tipoId}/secciones/${seccionId}/campos/${campoId}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { tipoId }) => [{ type: 'TipoTramite', id: tipoId }],
    }),
    deleteCampo: build.mutation({
      query: ({ tipoId, seccionId, campoId }) => ({ url: `/tipos-tramite/${tipoId}/secciones/${seccionId}/campos/${campoId}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, { tipoId }) => [{ type: 'TipoTramite', id: tipoId }],
    }),
    reorderCampos: build.mutation({
      query: ({ tipoId, seccionId, ids }) => ({ url: `/tipos-tramite/${tipoId}/secciones/${seccionId}/campos/reorder`, method: 'PATCH', body: { ids } }),
      invalidatesTags: (_r, _e, { tipoId }) => [{ type: 'TipoTramite', id: tipoId }],
    }),
  }),
});

export const {
  useGetTiposTramiteQuery,
  useGetTipoTramiteQuery,
  useCreateTipoTramiteMutation,
  useUpdateTipoTramiteMutation,
  useDeleteTipoTramiteMutation,
  useActivarTipoTramiteMutation,
  useNuevaVersionTipoTramiteMutation,
  useSetModoAsignacionMutation,
  useCreateSeccionMutation,
  useUpdateSeccionMutation,
  useDeleteSeccionMutation,
  useReorderSeccionesMutation,
  useCreateCampoMutation,
  useUpdateCampoMutation,
  useDeleteCampoMutation,
  useReorderCamposMutation,
} = tiposTramiteApi;
