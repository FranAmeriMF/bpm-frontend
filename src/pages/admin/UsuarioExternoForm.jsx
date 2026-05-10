import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import {
  useGetUsuarioQuery,
  useCreateUsuarioMutation,
  useUpdateUsuarioMutation,
  useResetPasswordUsuarioMutation,
} from '@api/usuariosApi';
import { useGetEmpresasQuery } from '@api/empresasApi';
import { Button, Card, Input, Spinner } from '@components/atoms';
import { ConfirmDialog } from '@components/molecules';

const ROLES_EXTERNOS = [
  { value: 'solicitante', label: 'Solicitante' },
  { value: 'director',    label: 'Director' },
];

const schema = yup.object({
  nombre:     yup.string().required('Requerido'),
  apellido:   yup.string().required('Requerido'),
  email:      yup.string().email('Email inválido').required('Requerido'),
  dni:        yup.string().required('Requerido'),
  telefono:   yup.string(),
  rol:        yup.string().required('Requerido'),
  empresa_id: yup.string().required('La empresa es obligatoria para usuarios externos'),
  cargo:      yup.string(),
});

const UsuarioExternoForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preEmpresaId = searchParams.get('empresa_id') ?? '';
  const preRol       = searchParams.get('rol')        ?? 'solicitante';

  const { data: usuario, isLoading: loadingUsuario } = useGetUsuarioQuery(id, { skip: !isEdit });
  const { data: empresasData } = useGetEmpresasQuery({ limit: 100, estado: 'activa' });
  const empresas = empresasData?.data ?? [];

  const [createUsuario, { isLoading: creating }]  = useCreateUsuarioMutation();
  const [updateUsuario, { isLoading: updating }]   = useUpdateUsuarioMutation();
  const [resetPassword, { isLoading: resetting }]  = useResetPasswordUsuarioMutation();
  const saving = creating || updating;
  const [confirmReset, setConfirmReset] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { rol: preRol, empresa_id: preEmpresaId },
  });

  useEffect(() => {
    if (usuario) {
      reset({
        nombre:     usuario.nombre     ?? '',
        apellido:   usuario.apellido   ?? '',
        email:      usuario.email      ?? '',
        dni:        usuario.dni        ?? '',
        telefono:   usuario.telefono   ?? '',
        rol:        usuario.rol        ?? 'solicitante',
        empresa_id: usuario.empresa_id ?? '',
        cargo:      usuario.cargo      ?? '',
      });
    }
  }, [usuario, reset]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      telefono: data.telefono || undefined,
      cargo:    data.cargo    || undefined,
    };
    try {
      if (isEdit) {
        await updateUsuario({ id, ...payload }).unwrap();
        toast.success('Usuario actualizado');
      } else {
        const created = await createUsuario(payload).unwrap();
        toast.success('Usuario creado. Se envió email con contraseña temporal.');
        navigate(`/usuarios-externos/${created.id}/editar`, { replace: true });
      }
    } catch (err) {
      toast.error(err.data?.message ?? 'Error al guardar');
    }
  };

  if (isEdit && loadingUsuario) {
    return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/usuarios-externos" className="text-label-sm text-on-surface-variant hover:underline">
          ← Usuarios Externos
        </Link>
        <h1 className="text-display-sm text-primary font-semibold mt-1">
          {isEdit ? 'Editar Usuario Externo' : 'Nuevo Usuario Externo'}
        </h1>
        {isEdit && usuario && (
          <p className="text-body-md text-on-surface-variant">
            {usuario.nombre} {usuario.apellido} · {usuario.email}
          </p>
        )}
      </div>

      <Card elevated>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Nombre"
              required
              error={errors.nombre?.message}
              {...register('nombre')}
            />
            <Input
              label="Apellido"
              required
              error={errors.apellido?.message}
              {...register('apellido')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Email"
              type="email"
              required
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="DNI"
              required
              error={errors.dni?.message}
              {...register('dni')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Teléfono"
              error={errors.telefono?.message}
              {...register('telefono')}
            />
            <Input
              label="Cargo"
              placeholder="Ej: Responsable Técnico"
              error={errors.cargo?.message}
              {...register('cargo')}
            />
          </div>

          {/* Rol */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1.5 font-medium">
              Rol <span className="text-error">*</span>
            </label>
            <select
              {...register('rol')}
              className="w-full h-10 px-3 rounded border border-outline-variant bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {ROLES_EXTERNOS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            {errors.rol && <p className="mt-1 text-label-sm text-error">{errors.rol.message}</p>}
          </div>

          {/* Empresa */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1.5 font-medium">
              Empresa <span className="text-error">*</span>
            </label>
            <select
              {...register('empresa_id')}
              className="w-full h-10 px-3 rounded border border-outline-variant bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">Seleccioná una empresa</option>
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>{e.razon_social}</option>
              ))}
            </select>
            {errors.empresa_id && (
              <p className="mt-1 text-label-sm text-error">{errors.empresa_id.message}</p>
            )}
          </div>

          {!isEdit && (
            <p className="text-label-sm text-on-surface-variant bg-surface-container-low rounded px-4 py-3">
              Se generará una contraseña temporal y se enviará por email al usuario. Deberá cambiarla en su primer ingreso.
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Link to="/usuarios-externos">
              <Button variant="secondary" type="button">Cancelar</Button>
            </Link>
            <Button type="submit" isLoading={saving}>
              {isEdit ? 'Guardar Cambios' : 'Crear Usuario'}
            </Button>
          </div>
        </form>
      </Card>

      {isEdit && (
        <Card elevated>
          <div className="p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-title-sm text-on-surface font-medium">Contraseña</p>
              <p className="text-body-sm text-on-surface-variant mt-0.5">
                Genera una contraseña temporal y la envía por email. El usuario deberá cambiarla al ingresar.
              </p>
            </div>
            <Button variant="secondary" type="button" onClick={() => setConfirmReset(true)}>
              Resetear contraseña
            </Button>
          </div>
        </Card>
      )}

      <ConfirmDialog
        isOpen={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={async () => {
          try {
            await resetPassword(id).unwrap();
            toast.success('Contraseña temporal enviada por email');
          } catch (err) {
            toast.error(err.data?.message ?? 'Error al resetear contraseña');
          }
          setConfirmReset(false);
        }}
        isLoading={resetting}
        title="Resetear contraseña"
        message={`¿Generás una nueva contraseña temporal para ${usuario?.nombre} ${usuario?.apellido}? Se enviará por email y deberá cambiarla al ingresar.`}
        confirmLabel="Sí, resetear"
        variant="default"
      />
    </div>
  );
};

export default UsuarioExternoForm;
