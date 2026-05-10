import { baseApi } from './baseApi';
import client from './client';

// RTK Query para eliminar
export const archivosApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    deleteArchivo: build.mutation({
      query: (id) => ({ url: `/archivos/${id}`, method: 'DELETE' }),
      // Invalida el tramite padre para que recargue la lista de archivos
      invalidatesTags: [{ type: 'Tramite', id: 'LIST' }],
    }),
  }),
});

export const { useDeleteArchivoMutation } = archivosApi;

/**
 * Upload multipart con soporte de progreso.
 * Usar Axios directamente porque fetchBaseQuery no expone onUploadProgress.
 *
 * @param {{ tramite_id: string, seccion_id?: string, file: File, onProgress?: (pct: number) => void }}
 * @returns {Promise<AxiosResponse>}
 */
export const uploadArchivo = ({ tramite_id, seccion_id, file, onProgress }) => {
  const form = new FormData();
  form.append('file', file);

  const url = seccion_id
    ? `/archivos/upload/${tramite_id}?seccion_id=${seccion_id}`
    : `/archivos/upload/${tramite_id}`;

  return client.post(url, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
      ? (e) => onProgress(Math.round((e.loaded * 100) / (e.total ?? e.loaded)))
      : undefined,
  });
};
