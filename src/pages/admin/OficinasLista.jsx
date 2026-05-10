import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  useGetOficinasQuery,
  useUpdateOficinaMutation,
} from '@api/oficinasApi';
import { Button, Spinner } from '@components/atoms';
import { SearchBar, Pagination } from '@components/molecules';
import { cn } from '@utils/helpers';

const LIMIT = 20;

const OficinaBadge = ({ estado }) => (
  <span className={cn(
    'inline-flex items-center px-3 py-1 rounded-full text-label-md font-medium',
    estado === 'activa'
      ? 'bg-tertiary-fixed text-on-tertiary-fixed'
      : 'bg-error-container text-on-error-container',
  )}>
    {estado === 'activa' ? 'Activa' : 'Inactiva'}
  </span>
);

const OficinasLista = () => {
  const navigate = useNavigate();
  const [search, setSearch]     = useState('');
  const [estado, setEstado]     = useState('');
  const [page, setPage]         = useState(1);

  const { data, isLoading } = useGetOficinasQuery({
    ...(search && { buscar: search }),
    ...(estado && { estado }),
    page,
    limit: LIMIT,
  });
  const [updateOficina, { isLoading: toggling }] = useUpdateOficinaMutation();

  const oficinas   = data?.data ?? [];
  const total      = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const handleToggle = async (oficina) => {
    const next = oficina.estado === 'activa' ? 'inactiva' : 'activa';
    try {
      await updateOficina({ id: oficina.id, estado: next }).unwrap();
      toast.success(`Oficina ${next === 'activa' ? 'activada' : 'desactivada'}`);
    } catch (err) {
      toast.error(err.data?.message ?? 'Error al cambiar estado');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm text-primary font-semibold">Oficinas</h1>
          {!isLoading && (
            <p className="text-body-md text-on-surface-variant mt-1">
              {total} oficina{total !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Link to="/oficinas/nueva">
          <Button>+ Nueva Oficina</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          onClear={() => { setSearch(''); setPage(1); }}
          placeholder="Buscar por nombre o código..."
          className="flex-1"
        />
        <select
          value={estado}
          onChange={(e) => { setEstado(e.target.value); setPage(1); }}
          className="h-10 px-3 rounded border border-outline-variant bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 w-44"
        >
          <option value="">Todos los estados</option>
          <option value="activa">Activa</option>
          <option value="inactiva">Inactiva</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : oficinas.length === 0 ? (
        <div className="py-16 text-center text-body-md text-on-surface-variant italic">
          Sin oficinas registradas.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded shadow-ambient">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant text-left">
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Código</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Decisión Final</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {oficinas.map((o) => (
                  <tr key={o.id} className="bg-surface hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3 font-medium text-on-surface">
                      <div>{o.nombre}</div>
                      {o.descripcion && (
                        <div className="text-label-sm text-on-surface-variant truncate max-w-xs">
                          {o.descripcion}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-label-md text-on-surface-variant uppercase">
                      {o.codigo}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{o.email ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-medium',
                        o.permite_decision_final
                          ? 'bg-primary-fixed text-on-primary-container'
                          : 'bg-surface-container-high text-on-surface-variant',
                      )}>
                        {o.permite_decision_final ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <OficinaBadge estado={o.estado} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/oficinas/${o.id}/editar`)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant={o.estado === 'activa' ? 'tertiary' : 'secondary'}
                          isLoading={toggling}
                          onClick={() => handleToggle(o)}
                        >
                          {o.estado === 'activa' ? 'Desactivar' : 'Activar'}
                        </Button>
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

export default OficinasLista;
