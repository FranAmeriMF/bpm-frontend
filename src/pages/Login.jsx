import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { setCredentials } from '@store/authSlice';
import { useLoginMutation } from '@api/authApi';
import { AuthLayout } from '@components/templates';
import { Button, Input } from '@components/atoms';

const schema = yup.object({
  email: yup.string().email('Email inválido').required('Requerido'),
  password: yup.string().min(6, 'Mínimo 6 caracteres').required('Requerido'),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? '/dashboard';

  const [login, { isLoading }] = useLoginMutation();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const { access_token, user } = await login(data).unwrap();
      dispatch(setCredentials({ token: access_token, user }));
      navigate(user.requiere_cambio_password ? '/change-password' : from, { replace: true });
    } catch (err) {
      toast.error(err.data?.message ?? 'Credenciales inválidas');
    }
  };

  return (
    <AuthLayout title="Gestor de Trámites" subtitle="Sistema de Trámites">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="admin@municipio.gov.ar"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-label-sm text-primary hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
          Iniciar Sesión
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Login;
