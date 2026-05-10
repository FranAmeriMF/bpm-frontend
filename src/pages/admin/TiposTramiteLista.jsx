import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  useGetTiposTramiteQuery,
  useDeleteTipoTramiteMutation,
  useActivarTipoTramiteMutation,
  useNuevaVersionTipoTramiteMutation,
} from '@api/tiposTramiteApi';
import { Button, Spinner } from '@components/atoms';
import { SearchBar, Pagination, ConfirmDialog } from '@components/molecules';
import { cn } from '@utils/helpers';

const LIMIT = 20;

const ESTADO_OPTIONS = [
  { value: 'borrador', label: 'Borrador' },
  { value: 'activo',   label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
];

const ESTADO_STYLES = {
  borrador: 'bg-surface-container text-on-surface-variant',
  activo:   'bg-tertiary-fixed text-on-tertiary-fixed',
  inactivo: 'bg-error-container text-on-error-container',
};

const EstadoBadge = ({ estado }) => (
  <span className={cn('inline-flex px-2.5 py-1 rounded-full text-label-sm font-medium', ESTADO_STYLES[estado] ?? ESTADO_STYLES.borrador)}>
    {{ borrador: 'Borrador', activo: 'Activo', inactivo: 'Inactivo' }[estado] ?? estado}
  </span>
);

const TiposTramiteLista = () => {
  const navigate  = useNavigate();
  const [search, setSearch]     = useState('');
  const [estado, setEstado]     = useState('');
  const [page, setPage]         = useState(1);
  const [toDelete, setToDelete] = useState(null);
  const [toActivar, setToActivar] = useState(null);

  const { data, isLoading } = useGetTiposTramiteQuery({
    ...(search && { buscar: search }),
    ...(estado && { estado }),
    page,
    limit: LIMIT,
  });

  const [deleteTipo,   { isLoading: deleting }]   = useDeleteTipoTramiteMutation();
  const [activarTipo,  { isLoading: activando }]  = useActivarTipoTramiteMutation();
  const [nuevaVersion, { isLoading: versionando }] = useNuevaVersionTipoTramiteMutation();

  const tipos      = data?.data       ?? [];
  const total      = data?.total      ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const reset = () => setPage(1);

  const handleActivar = async () => {
    try {
      await activarTipo(toActivar.id).unwrap();
      toast.success('Tipo de trámite activado');
      setToActivar(null);
    } catch (err) {
      toast.error(err.data?.message ?? 'Error al activar — verificá que tenga al menos una sección');
      setToActivar(null);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTipo(toDelete.id).unwrap();
      toast.success('Tipo de trámite eliminado');
      setToDelete(null);
    } catch (err) {
      toast.error(err.data?.message ?? 'No se pudo eliminar');
      setToDelete(null);
    }
  };

  const handleNuevaVersion = async (tipo) => {
    try {
      const nuevo = await nuevaVersion(tipo.id).unwrap();
      toast.success(`Nueva versión v${nuevo.version} creada`);
      navigate(`/tipos-tramite/${nuevo.id}/configurar`);
    } catch (err) {
      toast.error(err.data?.message ?? 'Error al crear nueva versión');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm text-primary font-semibold">Tipos de Trámite</h1>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            Formularios y flujos para cada tipo de solicitud
          </p>
          {!isLoading && (
            <p className="text-body-md text-on-surface-variant mt-1">
              {total} tipo{total !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Link to="/tipos-tramite/nuevo">
          <Button>+ Nuevo Tipo</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar
          value={search}
          onChange={(e) => { setSearch(e.target.value); reset(); }}
          onClear={() => { setSearch(''); reset(); }}
          placeholder="Buscar por nombre o código..."
          className="flex-1"
        />
        <select
          value={estado}
          onChange={(e) => { setEstado(e.target.value); reset(); }}
          className="h-10 px-3 rounded border border-outline-variant bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 w-44"
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
      ) : tipos.length === 0 ? (
        <div className="py-16 text-center text-body-md text-on-surface-variant italic">
          Sin tipos de trámite que coincidan.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded shadow-ambient">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant text-left">
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Código</th>
                  <th className="px-4 py-3 font-medium">Ver.</th>
                  <th className="px-4 py-3 font-medium">Asignación</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {tipos.map((t) => (
                  <tr key={t.id} className="bg-surface hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-on-surface">{t.nombre}</p>
                      {t.descripcion && (
                        <p className="text-label-sm text-on-surface-variant truncate max-w-xs">{t.descripcion}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-label-sm text-on-surface-variant">
                      {t.codigo}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant text-label-sm">
                      v{t.version}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant text-label-sm capitalize">
                      {t.modo_asignacion === 'automatico' ? 'Automático' : 'Manual'}
                    </td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={t.estado} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/tipos-tramite/${t.id}/configurar`)}
                        >
                          Configurar
                        </Button>
                        {t.estado === 'borrador' && (
                          <Button size="sm" variant="tertiary" onClick={() => setToActivar(t)}>
                            Activar
                          </Button>
                        )}
                        {t.estado === 'activo' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            isLoading={versionando}
                            onClick={() => handleNuevaVersion(t)}
                          >
                            Nueva versión
                          </Button>
                        )}
                        {t.estado === 'borrador' && (
                          <Button size="sm" variant="error" onClick={() => setToDelete(t)}>
                            Eliminar
                          </Button>
                        )}
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
        isOpen={!!toActivar}
        onClose={() => setToActivar(null)}
        onConfirm={handleActivar}
        isLoading={activando}
        title="Activar tipo de trámite"
        message={toActivar ? `¿Activar "${toActivar.nombre}"? Los solicitantes podrán usarlo para crear trámites.` : ''}
        variant="default"
      />
      <ConfirmDialog
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Eliminar tipo de trámite"
        message={`¿Eliminás "${toDelete?.nombre}"? Esta acción no se puede deshacer.`}
        variant="danger"
      />
    </div>
  );
};

export default TiposTramiteLista;
