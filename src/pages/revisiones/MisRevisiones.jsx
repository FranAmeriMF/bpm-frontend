import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetTramitesQuery, useIniciarRevisionMutation } from '@api/tramitesApi';
import { useGetTiposTramiteQuery } from '@api/tiposTramiteApi';
import { useGetEmpresasQuery } from '@api/empresasApi';
import { toast } from 'react-toastify';
import { Button, DateInput, Spinner, StatusPill } from '@components/atoms';
import { SearchBar, FilterDropdown, EmptyState, Pagination } from '@components/molecules';
import { formatDate } from '@utils/helpers';

const LIMIT = 20;

const ESTADO_OPTIONS = [
  { value: 'asignado',    label: 'Asignado' },
  { value: 'en_revision', label: 'En Revisión' },
];

const ESTADOS_ACTIVOS = new Set(['asignado', 'en_revision']);

const deriveTramites = (data, estado) => {
  const all = data?.data ?? [];
  const tramites = estado ? all : all.filter((t) => ESTADOS_ACTIVOS.has(t.estado));
  const total      = estado ? (data?.total     ?? 0) : tramites.length;
  const totalPages = estado ? (data?.totalPages ?? 1) : 1;
  return { tramites, total, totalPages };
};

const MisRevisiones = () => {
  const [search,     setSearch]     = useState('');
  const [estado,     setEstado]     = useState(null);
  const [tipoId,     setTipoId]     = useState(null);
  const [empresaId,  setEmpresaId]  = useState(null);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [page,       setPage]       = useState(1);

  const withReset = (setter) => (value) => { setter(value); setPage(1); };

  const { data, isLoading } = useGetTramitesQuery({
    ...(search     && { numero: search }),
    ...(estado     && { estado }),
    ...(tipoId     && { tipo_tramite_id: tipoId }),
    ...(empresaId  && { empresa_id: empresaId }),
    ...(fechaDesde && { fecha_desde: fechaDesde }),
    ...(fechaHasta && { fecha_hasta: fechaHasta }),
    page,
    limit: LIMIT,
  });

  const { data: tipos }       = useGetTiposTramiteQuery();
  const { data: empresasData } = useGetEmpresasQuery();

  const tipoOptions    = (tipos?.data ?? []).map((t) => ({ value: t.id, label: t.nombre }));
  const empresaOptions = (empresasData?.data ?? []).map((e) => ({ value: e.id, label: e.razon_social }));

  const [iniciarRevision] = useIniciarRevisionMutation();

  const { tramites, total, totalPages } = deriveTramites(data, estado);
  const hasFilters = search || estado || tipoId || empresaId || fechaDesde || fechaHasta;

  const handleIniciar = async (id) => {
    try {
      await iniciarRevision(id).unwrap();
      toast.success('Revisión iniciada');
    } catch (err) {
      toast.error(err.data?.message ?? 'Error al iniciar');
    }
  };

  const clearFechas = () => { withReset(setFechaDesde)(''); withReset(setFechaHasta)(''); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display-sm text-primary font-semibold">Mis Revisiones</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Trámites asignados a tu revisión
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
            options={ESTADO_OPTIONS}
            value={estado}
            onChange={withReset(setEstado)}
            placeholder="Estado activo"
            className="w-48"
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
          <FilterDropdown
            options={empresaOptions}
            value={empresaId}
            onChange={withReset(setEmpresaId)}
            placeholder="Todas las empresas"
            className="w-56"
          />
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
          title={hasFilters ? 'Sin resultados' : 'Sin revisiones asignadas'}
          description={
            hasFilters
              ? 'No hay trámites que coincidan con los filtros aplicados.'
              : 'No tenés trámites asignados en este momento.'
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
                  <th className="px-4 py-3 font-medium text-right">Acción</th>
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
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {t.estado === 'asignado' && (
                          <Button size="sm" onClick={() => handleIniciar(t.id)}>Iniciar</Button>
                        )}
                        <Link to={`/revisiones/${t.id}`}>
                          <Button size="sm" variant="secondary">
                            {t.estado === 'en_revision' ? 'Continuar' : 'Ver'}
                          </Button>
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

export default MisRevisiones;
