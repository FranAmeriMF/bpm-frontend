import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useResetPasswordTokenMutation } from '@api/authApi';
import { AuthLayout } from '@components/templates';
import { Button, Input } from '@components/atoms';

const schema = yup.object({
  nueva_password: yup.string().min(8, 'Mínimo 8 caracteres').required('Requerido'),
  confirmar:      yup.string()
    .oneOf([yup.ref('nueva_password')], 'Las contraseñas no coinciden')
    .required('Requerido'),
});

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();

  const [resetPassword, { isLoading }] = useResetPasswordTokenMutation();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  if (!token) {
    return (
      <AuthLayout title="Enlace inválido" subtitle="El enlace de recuperación no es válido o ya expiró.">
        <Link to="/forgot-password">
          <Button className="w-full">Solicitar nuevo enlace</Button>
        </Link>
      </AuthLayout>
    );
  }

  const onSubmit = async ({ nueva_password }) => {
    try {
      await resetPassword({ token, nueva_password }).unwrap();
      toast.success('Contraseña actualizada. Ya podés iniciar sesión.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.data?.message ?? 'El enlace es inválido o ya expiró');
    }
  };

  return (
    <AuthLayout
      title="Nueva contraseña"
      subtitle="Ingresá tu nueva contraseña. El enlace tiene una validez de 15 minutos."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nueva contraseña"
          type="password"
          placeholder="••••••••"
          error={errors.nueva_password?.message}
          {...register('nueva_password')}
        />
        <Input
          label="Confirmar nueva contraseña"
          type="password"
          placeholder="••••••••"
          error={errors.confirmar?.message}
          {...register('confirmar')}
        />
        <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
          Restablecer contraseña
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
