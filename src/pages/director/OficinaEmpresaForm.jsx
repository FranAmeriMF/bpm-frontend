import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useAuth } from '@hooks/useAuth';
import {
  useGetOficinaEmpresaQuery,
  useCreateOficinaEmpresaMutation,
  useUpdateOficinaEmpresaMutation,
  useAsignarUsuarioOficinaMutation,
  useDesasignarUsuarioOficinaMutation,
} from '@api/oficinasEmpresaApi';
import { useGetEmpresaUsuariosQuery } from '@api/empresasApi';
import { Button, Card, Input, Spinner } from '@components/atoms';

const ROL_LABELS = {
  solicitante:  'Solicitante',
  director:     'Director',
  admin:        'Administrador',
  moderador:    'Moderador',
  jefe_oficina: 'Jefe de Oficina',
  interno:      'Técnico Interno',
};

const schema = yup.object({
  nombre:      yup.string().required('Requerido').max(100),
  descripcion: yup.string(),
  direccion:   yup.string().max(255),
  telefono:    yup.string().max(50),
});

const OficinaEmpresaForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const empresaId = user?.empresa_id;
  const [selectedUsuarioId, setSelectedUsuarioId] = useState('');

  const { data: oficina, isLoading: loadingOficina } = useGetOficinaEmpresaQuery(
    { empresa_id: empresaId, id },
    { skip: !isEdit || !empresaId },
  );

  const { data: todosUsuarios = [] } = useGetEmpresaUsuariosQuery(empresaId, {
    skip: !isEdit || !empresaId,
  });

  const [createOficina, { isLoading: creating }]     = useCreateOficinaEmpresaMutation();
  const [updateOficina, { isLoading: updating }]      = useUpdateOficinaEmpresaMutation();
  const [asignarUsuario, { isLoading: asignando }]    = useAsignarUsuarioOficinaMutation();
  const [desasignarUsuario, { isLoading: quitando }]  = useDesasignarUsuarioOficinaMutation();
  const saving = creating || updating;

  const asignados    = oficina?.usuarios ?? [];
  const asignadosIds = new Set(asignados.map((u) => u.id));
  const disponibles  = todosUsuarios.filter((u) => !asignadosIds.has(u.id));

  const handleAsignar = async () => {
    if (!selectedUsuarioId) return;
    try {
      await asignarUsuario({ empresa_id: empresaId, id, usuario_id: selectedUsuarioId }).unwrap();
      toast.success('Usuario asignado a la oficina');
      setSelectedUsuarioId('');
    } catch (err) {
      toast.error(err.data?.message ?? 'Error al asignar');
    }
  };

  const handleDesasignar = async (usuario_id) => {
    try {
      await desasignarUsuario({ empresa_id: empresaId, id, usuario_id }).unwrap();
      toast.success('Usuario quitado de la oficina');
    } catch (err) {
      toast.error(err.data?.message ?? 'Error al quitar');
    }
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { nombre: '', descripcion: '', direccion: '', telefono: '' },
  });

  useEffect(() => {
    if (oficina) {
      reset({
        nombre:      oficina.nombre      ?? '',
        descripcion: oficina.descripcion ?? '',
        direccion:   oficina.direccion   ?? '',
        telefono:    oficina.telefono    ?? '',
      });
    }
  }, [oficina, reset]);

  const onSubmit = async (data) => {
    const payload = {
      empresa_id:  empresaId,
      nombre:      data.nombre,
      descripcion: data.descripcion || undefined,
      direccion:   data.direccion   || undefined,
      telefono:    data.telefono    || undefined,
    };
    try {
      if (isEdit) {
        await updateOficina({ ...payload, id }).unwrap();
        toast.success('Oficina actualizada');
      } else {
        const created = await createOficina(payload).unwrap();
        toast.success('Oficina creada');
        navigate(`/mis-oficinas/${created.id}/editar`, { replace: true });
      }
    } catch (err) {
      toast.error(err.data?.message ?? 'Error al guardar');
    }
  };

  if (isEdit && loadingOficina) {
    return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6 max-w">
      <div>
        <Link to="/mis-oficinas" className="text-label-sm text-on-surface-variant hover:underline">
          ← Oficinas
        </Link>
        <h1 className="text-display-sm text-primary font-semibold mt-1">
          {isEdit ? 'Editar Oficina' : 'Nueva Oficina'}
        </h1>
        {isEdit && oficina && (
          <p className="text-body-md text-on-surface-variant">{oficina.nombre}</p>
        )}
      </div>

      <Card elevated>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <Input
            label="Nombre"
            required
            placeholder="Ej: Oficina Centro"
            error={errors.nombre?.message}
            {...register('nombre')}
          />

          <Input
            label="Descripción"
            placeholder="Ej: Atención al cliente y mesa de entradas"
            error={errors.descripcion?.message}
            {...register('descripcion')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Dirección"
              placeholder="Ej: Av. Colón 456, Córdoba"
              error={errors.direccion?.message}
              {...register('direccion')}
            />
            <Input
              label="Teléfono"
              placeholder="Ej: 351 555-1234"
              error={errors.telefono?.message}
              {...register('telefono')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link to="/mis-oficinas">
              <Button variant="secondary" type="button">Cancelar</Button>
            </Link>
            <Button type="submit" isLoading={saving}>
              {isEdit ? 'Guardar Cambios' : 'Crear Oficina'}
            </Button>
          </div>
        </form>
      </Card>

      {isEdit && (
        <Card elevated>
          <div className="p-6 space-y-4">
            <h2 className="text-title-md text-on-surface font-semibold">Usuarios asignados</h2>

            {asignados.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant italic">
                Ningún usuario asignado a esta oficina.
              </p>
            ) : (
              <div className="overflow-x-auto rounded border border-outline-variant/30">
                <table className="w-full text-body-sm">
                  <thead>
                    <tr className="bg-surface-container text-on-surface-variant text-left">
                      <th className="px-4 py-2.5 font-medium">Nombre</th>
                      <th className="px-4 py-2.5 font-medium">Email</th>
                      <th className="px-4 py-2.5 font-medium">Rol</th>
                      <th className="px-4 py-2.5 font-medium text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {asignados.map((u) => (
                      <tr key={u.id} className="bg-surface">
                        <td className="px-4 py-2.5 text-on-surface font-medium">
                          {u.nombre} {u.apellido}
                        </td>
                        <td className="px-4 py-2.5 text-on-surface-variant">{u.email}</td>
                        <td className="px-4 py-2.5 text-on-surface-variant">
                          {ROL_LABELS[u.rol] ?? u.rol}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <Button
                            size="sm"
                            variant="error"
                            isLoading={quitando}
                            onClick={() => handleDesasignar(u.id)}
                          >
                            Quitar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {disponibles.length > 0 && (
              <div className="flex items-center gap-3 pt-2 border-t border-outline-variant/20">
                <select
                  value={selectedUsuarioId}
                  onChange={(e) => setSelectedUsuarioId(e.target.value)}
                  className="flex-1 h-10 px-3 rounded border border-outline-variant bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">Seleccioná un usuario…</option>
                  {disponibles.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre} {u.apellido} — {ROL_LABELS[u.rol] ?? u.rol}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  isLoading={asignando}
                  disabled={!selectedUsuarioId}
                  onClick={handleAsignar}
                >
                  Asignar
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default OficinaEmpresaForm;
