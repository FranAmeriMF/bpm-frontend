import { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '@hooks/useAuth';
import { useGetEmpresaUsuariosQuery } from '@api/empresasApi';
import {
  useChangeStatusUsuarioMutation,
  useResetPasswordUsuarioMutation,
} from '@api/usuariosApi';
import { Button, Spinner } from '@components/atoms';
import { ConfirmDialog } from '@components/molecules';
import { cn, formatDate } from '@utils/helpers';

const ROL_LABELS = {
  solicitante:  'Solicitante',
  director:     'Director',
  admin:        'Administrador',
  moderador:    'Moderador',
  jefe_oficina: 'Jefe de Oficina',
  interno:      'Técnico Interno',
};

const ESTADO_STYLES = {
  activo:     'bg-tertiary-fixed text-on-tertiary-fixed',
  inactivo:   'bg-surface-container-high text-on-surface-variant',
  suspendido: 'bg-error-container text-on-error-container',
};

const EstadoBadge = ({ estado }) => (
  <span className={cn(
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-medium',
    ESTADO_STYLES[estado] ?? ESTADO_STYLES.inactivo,
  )}>
    {estado.charAt(0).toUpperCase() + estado.slice(1)}
  </span>
);

const UsuariosEmpresa = () => {
  const { user } = useAuth();
  const empresaId = user?.empresa_id;

  const [search, setSearch]         = useState('');
  const [confirmReset, setConfirmReset] = useState(null);

  const { data: usuarios = [], isLoading } = useGetEmpresaUsuariosQuery(empresaId, {
    skip: !empresaId,
  });

  const [changeStatus, { isLoading: toggling }] = useChangeStatusUsuarioMutation();
  const [resetPassword, { isLoading: resetting }] = useResetPasswordUsuarioMutation();

  const filtered = search.trim()
    ? usuarios.filter((u) => {
        const q = search.toLowerCase();
        return (
          u.nombre?.toLowerCase().includes(q) ||
          u.apellido?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.dni?.includes(q)
        );
      })
    : usuarios;

  const handleToggleEstado = async (u) => {
    const next = u.estado === 'activo' ? 'inactivo' : 'activo';
    try {
      await changeStatus({ id: u.id, estado: next }).unwrap();
      toast.success(`Usuario ${next === 'activo' ? 'activado' : 'desactivado'}`);
    } catch (err) {
      toast.error(err.data?.message ?? 'Error al cambiar estado');
    }
  };

  const handleReset = async () => {
    try {
      await resetPassword(confirmReset.id).unwrap();
      toast.success('Contraseña temporal enviada por email');
    } catch (err) {
      toast.error(err.data?.message ?? 'Error al resetear contraseña');
    }
    setConfirmReset(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm text-primary font-semibold">Usuarios de la Empresa</h1>
          {!isLoading && (
            <p className="text-body-md text-on-surface-variant mt-1">
              {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, email o DNI…"
          className="flex-1 h-10 px-3 rounded border border-outline-variant bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        {search && (
          <Button variant="secondary" onClick={() => setSearch('')}>
            Limpiar
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-body-md text-on-surface-variant italic">
          {search ? 'Sin resultados para la búsqueda.' : 'No hay usuarios registrados en tu empresa.'}
        </div>
      ) : (
        <div className="overflow-x-auto rounded shadow-ambient">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant text-left">
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Último acceso</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filtered.map((u) => (
                <tr key={u.id} className="bg-surface hover:bg-surface-container-low transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-on-surface">
                      {u.nombre} {u.apellido}
                    </p>
                    <p className="text-label-sm text-on-surface-variant">{u.email}</p>
                    {u.cargo && (
                      <p className="text-label-sm text-on-surface-variant italic">{u.cargo}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {ROL_LABELS[u.rol] ?? u.rol}
                  </td>
                  <td className="px-4 py-3">
                    <EstadoBadge estado={u.estado} />
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant tabular-nums">
                    {u.ultimo_acceso
                      ? formatDate(u.ultimo_acceso, 'dd/MM/yyyy HH:mm')
                      : <span className="italic">Nunca</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant={u.estado === 'activo' ? 'tertiary' : 'secondary'}
                        isLoading={toggling}
                        onClick={() => handleToggleEstado(u)}
                      >
                        {u.estado === 'activo' ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setConfirmReset(u)}
                      >
                        Reset contraseña
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmReset}
        onClose={() => setConfirmReset(null)}
        onConfirm={handleReset}
        isLoading={resetting}
        title="Resetear contraseña"
        message={`¿Generás una nueva contraseña temporal para ${confirmReset?.nombre} ${confirmReset?.apellido}? Se enviará por email y deberá cambiarla al ingresar.`}
        confirmLabel="Sí, resetear"
        variant="default"
      />
    </div>
  );
};

export default UsuariosEmpresa;
