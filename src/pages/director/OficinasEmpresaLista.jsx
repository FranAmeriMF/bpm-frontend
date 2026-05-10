import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '@hooks/useAuth';
import {
  useGetOficinasEmpresaQuery,
  useUpdateOficinaEmpresaMutation,
} from '@api/oficinasEmpresaApi';
import { Button, Spinner } from '@components/atoms';
import { cn } from '@utils/helpers';

const EstadoBadge = ({ estado }) => (
  <span className={cn(
    'inline-flex items-center px-3 py-1 rounded-full text-label-md font-medium',
    estado === 'activa'
      ? 'bg-tertiary-fixed text-on-tertiary-fixed'
      : 'bg-surface-container-high text-on-surface-variant',
  )}>
    {estado === 'activa' ? 'Activa' : 'Inactiva'}
  </span>
);

const OficinasEmpresaLista = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const empresaId = user?.empresa_id;

  const { data: oficinas = [], isLoading } = useGetOficinasEmpresaQuery(empresaId, {
    skip: !empresaId,
  });

  const [updateOficina, { isLoading: toggling }] = useUpdateOficinaEmpresaMutation();

  const handleToggle = async (of) => {
    const next = of.estado === 'activa' ? 'inactiva' : 'activa';
    try {
      await updateOficina({ empresa_id: empresaId, id: of.id, estado: next }).unwrap();
      toast.success(`Oficina ${next === 'activa' ? 'activada' : 'desactivada'}`);
    } catch (err) {
      toast.error(err.data?.message ?? 'Error al cambiar estado');
    }
  };

  if (!empresaId) {
    return (
      <div className="py-16 text-center text-body-md text-on-surface-variant italic">
        Tu cuenta no está asociada a una empresa.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm text-primary font-semibold">Oficinas</h1>
          {!isLoading && (
            <p className="text-body-md text-on-surface-variant mt-1">
              {oficinas.length} oficina{oficinas.length !== 1 ? 'es' : ''}
            </p>
          )}
        </div>
        <Link to="/mis-oficinas/nueva">
          <Button>+ Nueva Oficina</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : oficinas.length === 0 ? (
        <div className="py-16 text-center text-body-md text-on-surface-variant italic">
          Todavía no registraste oficinas.
        </div>
      ) : (
        <div className="overflow-x-auto rounded shadow-ambient">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant text-left">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Dirección</th>
                <th className="px-4 py-3 font-medium">Teléfono</th>
                <th className="px-4 py-3 font-medium">Usuarios</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {oficinas.map((of) => (
                <tr key={of.id} className="bg-surface hover:bg-surface-container-low transition-colors">
                  <td className="px-4 py-3 font-medium text-on-surface">
                    <div>{of.nombre}</div>
                    {of.descripcion && (
                      <div className="text-label-sm text-on-surface-variant truncate max-w-xs">
                        {of.descripcion}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{of.direccion ?? '—'}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{of.telefono ?? '—'}</td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {of.usuarios?.length ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <EstadoBadge estado={of.estado} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/mis-oficinas/${of.id}/editar`)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant={of.estado === 'activa' ? 'tertiary' : 'secondary'}
                        isLoading={toggling}
                        onClick={() => handleToggle(of)}
                      >
                        {of.estado === 'activa' ? 'Desactivar' : 'Activar'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default OficinasEmpresaLista;
