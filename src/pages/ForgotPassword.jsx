import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useForgotPasswordMutation } from '@api/authApi';
import { AuthLayout } from '@components/templates';
import { Button, Input } from '@components/atoms';

const schema = yup.object({
  email: yup.string().email('Email inválido').required('Requerido'),
});

const ForgotPassword = () => {
  const [sent, setSent] = useState(false);
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await forgotPassword(data).unwrap();
    } catch {
      // Always show success to avoid user enumeration
    }
    setSent(true);
  };

  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña."
    >
      {sent ? (
        <div className="space-y-4">
          <div className="rounded bg-tertiary-fixed/30 border border-tertiary-fixed px-4 py-3 text-body-sm text-on-surface">
            Si el email está registrado, recibirás un enlace de recuperación en los próximos minutos.
            Revisá también tu carpeta de spam.
          </div>
          <Link to="/login">
            <Button variant="secondary" className="w-full">Volver al inicio de sesión</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
            Enviar enlace de recuperación
          </Button>
          <p className="text-center text-label-sm text-on-surface-variant">
            <Link to="/login" className="hover:underline text-primary">
              ← Volver al inicio de sesión
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
