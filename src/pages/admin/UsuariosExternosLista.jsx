import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  useGetUsuariosQuery,
  useChangeStatusUsuarioMutation,
} from '@api/usuariosApi';
import { Button, Spinner } from '@components/atoms';
import { SearchBar, Pagination, ConfirmDialog } from '@components/molecules';
import { cn, ROL_LABELS, formatDate } from '@utils/helpers';

const LIMIT = 20;

const ROL_OPTIONS = [
  { value: 'solicitante', label: 'Solicitante' },
  { value: 'director',    label: 'Director' },
];

const ESTADO_OPTIONS = [
  { value: 'activo',     label: 'Activo' },
  { value: 'suspendido', label: 'Suspendido' },
  { value: 'inactivo',   label: 'Inactivo' },
];

const EstadoBadge = ({ estado }) => {
  const styles = {
    activo:     'bg-tertiary-fixed text-on-tertiary-fixed',
    suspendido: 'bg-tertiary-container text-on-tertiary-container',
    inactivo:   'bg-error-container text-on-error-container',
  };
  const labels = { activo: 'Activo', suspendido: 'Suspendido', inactivo: 'Inactivo' };
  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-label-md font-medium', styles[estado] ?? styles.inactivo)}>
      {labels[estado] ?? estado}
    </span>
  );
};

const UsuariosExternosLista = () => {
  const navigate = useNavigate();
  const [search, setSearch]             = useState('');
  const [rol, setRol]                   = useState('');
  const [estado, setEstado]             = useState('');
  const [page, setPage]                 = useState(1);
  const [statusTarget, setStatusTarget] = useState(null);

  const { data, isLoading } = useGetUsuariosQuery({
    tipo: 'externo',
    ...(search && { buscar: search }),
    ...(rol    && { rol }),
    ...(estado && { estado }),
    page,
    limit: LIMIT,
  });
  const [changeStatus, { isLoading: changingStatus }] = useChangeStatusUsuarioMutation();

  const usuarios   = data?.data ?? [];
  const total      = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const reset = () => setPage(1);

  const nextStatus = (current) => {
    if (current === 'activo')     return 'suspendido';
    if (current === 'suspendido') return 'inactivo';
    return 'activo';
  };
  const nextStatusLabel = (current) => {
    if (current === 'activo')     return 'Suspender';
    if (current === 'suspendido') return 'Desactivar';
    return 'Activar';
  };

  const handleStatusConfirm = async () => {
    try {
      await changeStatus({ id: statusTarget.user.id, estado: statusTarget.nextEstado }).unwrap();
      toast.success(`Usuario ${statusTarget.nextEstado}`);
      setStatusTarget(null);
    } catch (err) {
      toast.error(err.data?.message ?? 'Error al cambiar estado');
      setStatusTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm text-primary font-semibold">Usuarios Externos</h1>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            Solicitantes y directores — pertenecen a una empresa
          </p>
          {!isLoading && (
            <p className="text-body-md text-on-surface-variant mt-1">
              {total} usuario{total !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Link to="/usuarios-externos/nuevo">
          <Button>+ Nuevo Usuario Externo</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar
          value={search}
          onChange={(e) => { setSearch(e.target.value); reset(); }}
          onClear={() => { setSearch(''); reset(); }}
          placeholder="Buscar por nombre, email o DNI..."
          className="flex-1"
        />
        <select
          value={rol}
          onChange={(e) => { setRol(e.target.value); reset(); }}
          className="h-10 px-3 rounded border border-outline-variant bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 w-44"
        >
          <option value="">Todos los roles</option>
          {ROL_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
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
      ) : usuarios.length === 0 ? (
        <div className="py-16 text-center text-body-md text-on-surface-variant italic">
          Sin usuarios externos que coincidan con los filtros.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded shadow-ambient">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant text-left">
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Email / DNI</th>
                  <th className="px-4 py-3 font-medium">Empresa</th>
                  <th className="px-4 py-3 font-medium">Rol</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Último acceso</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {usuarios.map((u) => (
                  <tr key={u.id} className="bg-surface hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-on-surface">{u.nombre} {u.apellido}</p>
                      {u.cargo && <p className="text-label-sm text-on-surface-variant">{u.cargo}</p>}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      <p>{u.email}</p>
                      <p className="text-label-sm font-mono">{u.dni}</p>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {u.empresa?.razon_social ?? (
                        <span className="text-error text-label-sm">Sin empresa</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2.5 py-1 rounded bg-surface-container-high text-on-surface text-label-sm font-medium">
                        {ROL_LABELS[u.rol] ?? u.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={u.estado} />
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant text-label-sm hidden lg:table-cell">
                      {u.ultimo_acceso ? formatDate(u.ultimo_acceso, 'dd/MM/yyyy HH:mm') : 'Nunca'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <Button size="sm" variant="secondary" onClick={() => navigate(`/usuarios-externos/${u.id}/editar`)}>
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant={u.estado === 'activo' ? 'tertiary' : 'secondary'}
                          onClick={() => setStatusTarget({ user: u, nextEstado: nextStatus(u.estado) })}
                        >
                          {nextStatusLabel(u.estado)}
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
        isOpen={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleStatusConfirm}
        isLoading={changingStatus}
        title="Cambiar estado"
        message={statusTarget ? `¿${nextStatusLabel(statusTarget.user.estado)} a ${statusTarget.user.nombre} ${statusTarget.user.apellido}?` : ''}
        variant={statusTarget?.nextEstado === 'inactivo' ? 'danger' : 'default'}
      />
    </div>
  );
};

export default UsuariosExternosLista;
