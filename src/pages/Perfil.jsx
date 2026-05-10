import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useGetMeQuery, useUpdateMeMutation, useChangePasswordMutation } from '@api/authApi';
import { setCredentials, selectCurrentUser, selectToken } from '@store/authSlice';
import { Button, Card, Input, Spinner } from '@components/atoms';

const ROL_LABELS = {
  admin:        'Administrador',
  moderador:    'Moderador',
  jefe_oficina: 'Jefe de Oficina',
  interno:      'Técnico Interno',
  solicitante:  'Solicitante',
  director:     'Director',
};

const datosSchema = yup.object({
  nombre:   yup.string().required('Requerido'),
  apellido: yup.string().required('Requerido'),
  telefono: yup.string(),
  cargo:    yup.string(),
});

const passSchema = yup.object({
  password_actual: yup.string().required('Requerido'),
  password_nuevo:  yup.string().min(8, 'Mínimo 8 caracteres').required('Requerido'),
  confirmar:       yup.string()
    .oneOf([yup.ref('password_nuevo')], 'Las contraseñas no coinciden')
    .required('Requerido'),
});

const ReadField = ({ label, value }) => (
  <div>
    <p className="text-label-sm text-on-surface-variant mb-0.5">{label}</p>
    <p className="text-body-md text-on-surface">{value || '—'}</p>
  </div>
);

// ── Datos personales card ─────────────────────────────────────────────────────
const CardDatos = ({ me, token, dispatch }) => {
  const [updateMe, { isLoading }] = useUpdateMeMutation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(datosSchema),
    defaultValues: { nombre: '', apellido: '', telefono: '', cargo: '' },
  });

  useEffect(() => {
    if (me) {
      reset({
        nombre:   me.nombre   ?? '',
        apellido: me.apellido ?? '',
        telefono: me.telefono ?? '',
        cargo:    me.cargo    ?? '',
      });
    }
  }, [me, reset]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      telefono: data.telefono || undefined,
      cargo:    data.cargo    || undefined,
    };
    try {
      const updated = await updateMe(payload).unwrap();
      dispatch(setCredentials({ token, user: updated }));
      toast.success('Datos actualizados');
    } catch (err) {
      toast.error(err.data?.message ?? 'Error al guardar');
    }
  };

  return (
    <Card elevated>
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
        <h2 className="text-title-md text-on-surface font-semibold">Mis datos</h2>

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
            label="Teléfono"
            error={errors.telefono?.message}
            {...register('telefono')}
          />
          <Input
            label="Cargo"
            placeholder="Ej: Analista"
            error={errors.cargo?.message}
            {...register('cargo')}
          />
        </div>

        {/* Read-only fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1 border-t border-outline-variant/20">
          <ReadField label="Email" value={me?.email} />
          <ReadField label="DNI" value={me?.dni} />
          {me?.empresa && <ReadField label="Empresa" value={me.empresa.razon_social} />}
          {me?.oficina && <ReadField label="Oficina" value={me.oficina.nombre} />}
        </div>

        <div className="flex justify-end pt-1">
          <Button type="submit" isLoading={isLoading}>Guardar cambios</Button>
        </div>
      </form>
    </Card>
  );
};

// ── Cambiar contraseña card ───────────────────────────────────────────────────
const CardPassword = () => {
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(passSchema),
  });

  const onSubmit = async ({ password_actual, password_nuevo }) => {
    try {
      await changePassword({ password_actual, password_nuevo }).unwrap();
      toast.success('Contraseña actualizada correctamente');
      reset();
    } catch (err) {
      toast.error(err.data?.message ?? 'Error al cambiar contraseña');
    }
  };

  return (
    <Card elevated>
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
        <h2 className="text-title-md text-on-surface font-semibold">Cambiar contraseña</h2>

        <Input
          label="Contraseña actual"
          type="password"
          required
          error={errors.password_actual?.message}
          {...register('password_actual')}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Nueva contraseña"
            type="password"
            required
            error={errors.password_nuevo?.message}
            {...register('password_nuevo')}
          />
          <Input
            label="Confirmar nueva contraseña"
            type="password"
            required
            error={errors.confirmar?.message}
            {...register('confirmar')}
          />
        </div>

        <div className="flex justify-end pt-1">
          <Button type="submit" isLoading={isLoading}>Cambiar contraseña</Button>
        </div>
      </form>
    </Card>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const Perfil = () => {
  const dispatch = useDispatch();
  const storeUser = useSelector(selectCurrentUser);
  const token = useSelector(selectToken);

  const { data: me, isLoading } = useGetMeQuery();

  const user = me ?? storeUser;

  if (isLoading && !storeUser) {
    return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  }

  const initials = user
    ? `${user.nombre?.[0] ?? ''}${user.apellido?.[0] ?? ''}`.toUpperCase()
    : '?';

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-primary text-on-primary flex items-center justify-center flex-shrink-0">
          <span className="text-title-md font-semibold">{initials}</span>
        </div>
        <div>
          <h1 className="text-display-sm text-primary font-semibold">
            {user?.nombre} {user?.apellido}
          </h1>
          <p className="text-body-md text-on-surface-variant">
            {ROL_LABELS[user?.rol] ?? user?.rol}
            {user?.empresa && ` · ${user.empresa.razon_social}`}
            {user?.oficina && ` · ${user.oficina.nombre}`}
          </p>
        </div>
      </div>

      <CardDatos me={me ?? storeUser} token={token} dispatch={dispatch} />
      <CardPassword />
    </div>
  );
};

export default Perfil;
