import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetTramitesQuery } from '@api/tramitesApi';
import { useGetTiposTramiteQuery } from '@api/tiposTramiteApi';
import { useGetEmpresasQuery } from '@api/empresasApi';
import { useAuth } from '@hooks/useAuth';
import { Button, DateInput, Spinner, StatusPill } from '@components/atoms';
import { SearchBar, FilterDropdown, Pagination, EmptyState } from '@components/molecules';
import { TRAMITE_ESTADO_LABELS, formatDate } from '@utils/helpers';

const ESTADO_OPTIONS = Object.entries(TRAMITE_ESTADO_LABELS).map(([value, label]) => ({
  value,
  label,
}));
const LIMIT = 20;

const buildQuery = ({ search, estado, tipoId, empresaId, fechaDesde, fechaHasta, page }) => {
  const q = { page, limit: LIMIT };
  if (search)     q.search          = search;
  if (estado)     q.estado          = estado;
  if (tipoId)     q.tipo_tramite_id = tipoId;
  if (empresaId)  q.empresa_id      = empresaId;
  if (fechaDesde) q.fecha_desde     = fechaDesde;
  if (fechaHasta) q.fecha_hasta     = fechaHasta;
  return q;
};

const TramitesLista = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search,     setSearch]     = useState('');
  const [estado,     setEstado]     = useState(null);
  const [tipoId,     setTipoId]     = useState(null);
  const [empresaId,  setEmpresaId]  = useState(null);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [page,       setPage]       = useState(1);

  const withReset = (setter) => (value) => { setter(value); setPage(1); };

  const { data, isLoading } = useGetTramitesQuery(
    buildQuery({ search, estado, tipoId, empresaId, fechaDesde, fechaHasta, page }),
  );

  const { data: tipos }        = useGetTiposTramiteQuery();
  const { data: empresasData } = useGetEmpresasQuery({}, { skip: user?.rol === 'solicitante' });

  const tipoOptions    = (tipos?.data ?? []).map((t) => ({ value: t.id, label: t.nombre }));
  const empresaOptions = (empresasData?.data ?? []).map((e) => ({ value: e.id, label: e.razon_social }));

  const tramites   = data?.data ?? [];
  const total      = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const clearFechas = () => { withReset(setFechaDesde)(''); withReset(setFechaHasta)(''); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm text-primary font-semibold">Trámites</h1>
          {!isLoading && (
            <p className="text-body-md text-on-surface-variant mt-1">
              {total} trámite{total !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {user?.rol === 'solicitante' && (
          <Link to="/tramites/nuevo">
            <Button>+ Nuevo Trámite</Button>
          </Link>
        )}
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
            options={ESTADO_OPTIONS}
            value={estado}
            onChange={withReset(setEstado)}
            placeholder="Todos los estados"
            className="w-52"
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
          {user?.rol !== 'solicitante' && (
            <FilterDropdown
              options={empresaOptions}
              value={empresaId}
              onChange={withReset(setEmpresaId)}
              placeholder="Todas las empresas"
              className="w-56"
            />
          )}
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
        <EmptyState
          title="Sin resultados"
          description="No hay trámites que coincidan con los filtros aplicados."
          action={
            user?.rol === 'solicitante'
              ? { label: 'Nuevo Trámite', onClick: () => navigate('/tramites/nuevo') }
              : undefined
          }
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded shadow-ambient">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant text-left">
                  <th className="px-4 py-3 font-medium">Número</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Empresa</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3" />
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
                    <td className="px-4 py-3 text-on-surface-variant">{t.empresa?.razon_social}</td>
                    <td className="px-4 py-3"><StatusPill status={t.estado} /></td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {t.fecha_creacion ? formatDate(t.fecha_creacion, 'dd/MM/yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/tramites/${t.id}`}
                        className="text-primary text-label-md font-medium hover:underline"
                      >
                        Ver →
                      </Link>
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

export default TramitesLista;
