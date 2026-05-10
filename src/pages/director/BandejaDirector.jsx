import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useGetTramitesQuery, useAprobarDirectorMutation } from '@api/tramitesApi';
import { useGetTiposTramiteQuery } from '@api/tiposTramiteApi';
import { Button, DateInput, Spinner, StatusPill } from '@components/atoms';
import { SearchBar, FilterDropdown, EmptyState, Pagination } from '@components/molecules';
import { formatDate } from '@utils/helpers';

const LIMIT = 20;

const buildQuery = ({ search, tipoId, fechaDesde, fechaHasta, page }) => {
  const q = { estado: 'en_revision_interna', page, limit: LIMIT };
  if (search)     q.numero          = search;
  if (tipoId)     q.tipo_tramite_id = tipoId;
  if (fechaDesde) q.fecha_desde     = fechaDesde;
  if (fechaHasta) q.fecha_hasta     = fechaHasta;
  return q;
};

const BandejaDirector = () => {
  const [search,     setSearch]     = useState('');
  const [tipoId,     setTipoId]     = useState(null);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [page,       setPage]       = useState(1);

  const withReset = (setter) => (value) => { setter(value); setPage(1); };

  const { data, isLoading } = useGetTramitesQuery(
    buildQuery({ search, tipoId, fechaDesde, fechaHasta, page }),
  );

  const { data: tipos } = useGetTiposTramiteQuery();
  const tipoOptions = (tipos?.data ?? []).map((t) => ({ value: t.id, label: t.nombre }));

  const [aprobar, { isLoading: aprobando }] = useAprobarDirectorMutation();

  const tramites   = data?.data ?? [];
  const total      = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const hasFilters = search || tipoId || fechaDesde || fechaHasta;

  const emptyTitle = hasFilters ? 'Sin resultados' : 'Sin trámites pendientes';
  const emptyDesc  = hasFilters
    ? 'No hay trámites que coincidan con los filtros aplicados.'
    : 'No hay trámites en revisión interna en este momento.';

  const handleAprobar = async (id) => {
    try {
      await aprobar(id).unwrap();
      toast.success('Trámite aprobado');
    } catch (err) {
      toast.error(err.data?.message ?? 'Error al aprobar');
    }
  };

  const clearFechas = () => { withReset(setFechaDesde)(''); withReset(setFechaHasta)(''); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display-sm text-primary font-semibold">Bandeja de Revisión</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Trámites de tu empresa pendientes de aprobación
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar
            value={search}
            onChange={(e) => withReset(setSearch)(e.target.value)}
            onClear={() => withReset(setSearch)('')}
            placeholder="Buscar por número..."
            className="flex-1"
          />
          <FilterDropdown
            options={tipoOptions}
            value={tipoId}
            onChange={withReset(setTipoId)}
            placeholder="Todos los tipos"
            className="w-52"
          />
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-center">
          <DateInput label="Desde" value={fechaDesde} onChange={withReset(setFechaDesde)} />
          <DateInput label="Hasta" value={fechaHasta} onChange={withReset(setFechaHasta)} />
          {(fechaDesde || fechaHasta) && (
            <button
              type="button"
              className="text-label-sm text-on-surface-variant hover:text-error transition-colors"
              onClick={clearFechas}
            >
              Limpiar fechas
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : tramites.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDesc} />
      ) : (
        <>
          <div className="overflow-x-auto rounded shadow-ambient">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant text-left">
                  <th className="px-4 py-3 font-medium">Número</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Solicitante</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {tramites.map((t) => (
                  <tr
                    key={t.id}
                    className="bg-surface hover:bg-surface-container-low transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-label-md text-primary">{t.numero}</td>
                    <td className="px-4 py-3 text-on-surface">{t.tipo_tramite?.nombre}</td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {t.solicitante?.nombre} {t.solicitante?.apellido}
                    </td>
                    <td className="px-4 py-3"><StatusPill status={t.estado} /></td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {t.fecha_creacion ? formatDate(t.fecha_creacion, 'dd/MM/yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" onClick={() => handleAprobar(t.id)} isLoading={aprobando}>
                          Aprobar
                        </Button>
                        <Link to={`/tramites/${t.id}`}>
                          <Button size="sm" variant="secondary">Ver / Rechazar</Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={LIMIT}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};

export default BandejaDirector;
