import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useChangePasswordMutation } from '@api/authApi';
import { Button, Input } from '@components/atoms';

const schema = yup.object({
  password_actual: yup.string().required('Requerido'),
  password_nuevo: yup.string().min(8, 'Mínimo 8 caracteres').required('Requerido'),
  confirmar: yup
    .string()
    .oneOf([yup.ref('password_nuevo')], 'Las contraseñas no coinciden')
    .required('Requerido'),
});

const ChangePassword = () => {
  const navigate = useNavigate();
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async ({ password_actual, password_nuevo }) => {
    try {
      await changePassword({ password_actual, password_nuevo }).unwrap();
      toast.success('Contraseña actualizada correctamente');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.data?.message ?? 'Error al cambiar la contraseña');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Contraseña temporal (recibida por email)"
        type="password"
        placeholder="••••••••"
        error={errors.password_actual?.message}
        {...register('password_actual')}
      />
      <Input
        label="Nueva contraseña"
        type="password"
        placeholder="••••••••"
        error={errors.password_nuevo?.message}
        {...register('password_nuevo')}
      />
      <Input
        label="Confirmar nueva contraseña"
        type="password"
        placeholder="••••••••"
        error={errors.confirmar?.message}
        {...register('confirmar')}
      />
      <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
        Cambiar Contraseña
      </Button>
    </form>
  );
};

export default ChangePassword;
