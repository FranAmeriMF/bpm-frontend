import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  useGetPlantillasQuery,
  useDeletePlantillaMutation,
  useUpdatePlantillaMutation,
} from '@api/plantillasApi';
import { useGetOficinasQuery } from '@api/oficinasApi';
import { Button, Spinner } from '@components/atoms';
import { SearchBar, Pagination, ConfirmDialog } from '@components/molecules';
import { cn } from '@utils/helpers';

const LIMIT = 20;

const TIPO_OPTIONS = [
  { value: 'aprobado',  label: 'Aprobación' },
  { value: 'rechazado', label: 'Rechazo' },
  { value: 'observado', label: 'Observación' },
];

const ESTADO_OPTIONS = [
  { value: 'activa',   label: 'Activa' },
  { value: 'inactiva', label: 'Inactiva' },
];

const TIPO_COLORS = {
  aprobado:  'bg-tertiary-fixed text-on-tertiary-fixed',
  rechazado: 'bg-error-container text-on-error-container',
  observado: 'bg-secondary-container text-on-secondary-container',
};

const TIPO_LABELS = { aprobado: 'Aprobación', rechazado: 'Rechazo', observado: 'Observación' };

const TipoBadge = ({ tipo }) => (
  <span className={cn('inline-flex px-2.5 py-1 rounded text-label-sm font-medium', TIPO_COLORS[tipo] ?? 'bg-surface-container text-on-surface-variant')}>
    {TIPO_LABELS[tipo] ?? tipo}
  </span>
);

const EstadoBadge = ({ estado }) => {
  const styles = {
    activa:   'bg-tertiary-fixed text-on-tertiary-fixed',
    inactiva: 'bg-error-container text-on-error-container',
  };
  return (
    <span className={cn('inline-flex px-2.5 py-1 rounded-full text-label-sm font-medium', styles[estado] ?? styles.inactiva)}>
      {estado === 'activa' ? 'Activa' : 'Inactiva'}
    </span>
  );
};

const PlantillasLista = () => {
  const navigate = useNavigate();
  const [search, setSearch]     = useState('');
  const [oficina, setOficina]   = useState('');
  const [tipo, setTipo]         = useState('');
  const [estado, setEstado]     = useState('');
  const [page, setPage]         = useState(1);
  const [toDelete, setToDelete] = useState(null);

  const { data, isLoading } = useGetPlantillasQuery({
    ...(search  && { buscar: search }),
    ...(oficina && { oficina_id: oficina }),
    ...(tipo    && { tipo_decision: tipo }),
    ...(estado  && { estado }),
    page,
    limit: LIMIT,
  });
  const { data: oficinasData } = useGetOficinasQuery({ limit: 100 });
  const oficinas = oficinasData?.data ?? [];

  const [deletePlantilla, { isLoading: deleting }]   = useDeletePlantillaMutation();
  const [updatePlantilla, { isLoading: toggling }]   = useUpdatePlantillaMutation();

  const plantillas  = data?.data       ?? [];
  const total       = data?.total      ?? 0;
  const totalPages  = data?.totalPages ?? 1;

  const reset = () => setPage(1);

  const handleToggleEstado = async (p) => {
    const next = p.estado === 'activa' ? 'inactiva' : 'activa';
    try {
      await updatePlantilla({ id: p.id, estado: next }).unwrap();
      toast.success(`Plantilla ${next}`);
    } catch (err) {
      toast.error(err.data?.message ?? 'Error al cambiar estado');
    }
  };

  const handleDelete = async () => {
    try {
      await deletePlantilla(toDelete.id).unwrap();
      toast.success('Plantilla eliminada');
      setToDelete(null);
    } catch (err) {
      toast.error(err.data?.message ?? 'No se pudo eliminar');
      setToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm text-primary font-semibold">Plantillas de Mensaje</h1>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            Textos predefinidos para decisiones finales de trámites
          </p>
          {!isLoading && (
            <p className="text-body-md text-on-surface-variant mt-1">
              {total} plantilla{total !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Link to="/plantillas/nueva">
          <Button>+ Nueva Plantilla</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <SearchBar
          value={search}
          onChange={(e) => { setSearch(e.target.value); reset(); }}
          onClear={() => { setSearch(''); reset(); }}
          placeholder="Buscar por nombre..."
          className="flex-1 min-w-48"
        />
        <select
          value={oficina}
          onChange={(e) => { setOficina(e.target.value); reset(); }}
          className="h-10 px-3 rounded border border-outline-variant bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 w-52"
        >
          <option value="">Todas las oficinas</option>
          {oficinas.map((o) => (
            <option key={o.id} value={o.id}>{o.nombre}</option>
          ))}
        </select>
        <select
          value={tipo}
          onChange={(e) => { setTipo(e.target.value); reset(); }}
          className="h-10 px-3 rounded border border-outline-variant bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 w-44"
        >
          <option value="">Todos los tipos</option>
          {TIPO_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select
          value={estado}
          onChange={(e) => { setEstado(e.target.value); reset(); }}
          className="h-10 px-3 rounded border border-outline-variant bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 w-40"
        >
          <option value="">Todos los estados</option>
          {ESTADO_OPTIONS.map((e) => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : plantillas.length === 0 ? (
        <div className="py-16 text-center text-body-md text-on-surface-variant italic">
          Sin plantillas que coincidan con los filtros.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded shadow-ambient">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant text-left">
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Oficina</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Vista previa</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {plantillas.map((p) => (
                  <tr key={p.id} className="bg-surface hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-on-surface">{p.nombre}</p>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant text-label-sm">
                      {p.oficina?.nombre ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <TipoBadge tipo={p.tipo_decision} />
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant text-label-sm hidden md:table-cell max-w-xs">
                      <p className="truncate">{p.contenido}</p>
                    </td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={p.estado} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/plantillas/${p.id}/editar`)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant={p.estado === 'activa' ? 'tertiary' : 'secondary'}
                          isLoading={toggling}
                          onClick={() => handleToggleEstado(p)}
                        >
                          {p.estado === 'activa' ? 'Desactivar' : 'Activar'}
                        </Button>
                        <Button
                          size="sm"
                          variant="error"
                          onClick={() => setToDelete(p)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} total={total} limit={LIMIT} onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Eliminar plantilla"
        message={`¿Eliminás la plantilla "${toDelete?.nombre}"? Esta acción no se puede deshacer.`}
        variant="danger"
      />
    </div>
  );
};

export default PlantillasLista;
