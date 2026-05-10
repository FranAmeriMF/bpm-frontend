import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import {
  useGetOficinaQuery,
  useCreateOficinaMutation,
  useUpdateOficinaMutation,
} from '@api/oficinasApi';
import { Button, Card, Input, Spinner } from '@components/atoms';

const schema = yup.object({
  nombre:                yup.string().required('Requerido'),
  codigo:                yup.string().required('Requerido').matches(/^[A-Z0-9_-]+$/i, 'Solo letras, números, guiones y guiones bajos'),
  descripcion:           yup.string(),
  email:                 yup.string().email('Email inválido'),
  permite_decision_final: yup.boolean(),
});

const OficinaForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: oficina, isLoading: loadingOficina } = useGetOficinaQuery(id, { skip: !isEdit });

  const [createOficina, { isLoading: creating }] = useCreateOficinaMutation();
  const [updateOficina, { isLoading: updating }]  = useUpdateOficinaMutation();
  const saving = creating || updating;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { permite_decision_final: false },
  });

  useEffect(() => {
    if (oficina) {
      reset({
        nombre:                oficina.nombre                ?? '',
        codigo:                oficina.codigo                ?? '',
        descripcion:           oficina.descripcion           ?? '',
        email:                 oficina.email                 ?? '',
        permite_decision_final: oficina.permite_decision_final ?? false,
      });
    }
  }, [oficina, reset]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      descripcion: data.descripcion || undefined,
      email:       data.email       || undefined,
    };
    try {
      if (isEdit) {
        await updateOficina({ id, ...payload }).unwrap();
        toast.success('Oficina actualizada');
      } else {
        const created = await createOficina(payload).unwrap();
        toast.success('Oficina creada');
        navigate(`/oficinas/${created.id}/editar`, { replace: true });
      }
    } catch (err) {
      toast.error(err.data?.message ?? 'Error al guardar');
    }
  };

  if (isEdit && loadingOficina) {
    return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <Link to="/oficinas" className="text-label-sm text-on-surface-variant hover:underline">
          ← Oficinas
        </Link>
        <h1 className="text-display-sm text-primary font-semibold mt-1">
          {isEdit ? 'Editar Oficina' : 'Nueva Oficina'}
        </h1>
        {isEdit && oficina && (
          <p className="text-body-md text-on-surface-variant font-mono uppercase">{oficina.codigo}</p>
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
              label="Código"
              required
              placeholder="OBRAS"
              helperText="Identificador único, sin espacios"
              error={errors.codigo?.message}
              {...register('codigo')}
            />
          </div>

          <Input
            label="Descripción"
            error={errors.descripcion?.message}
            {...register('descripcion')}
          />

          <Input
            label="Email de contacto"
            type="email"
            placeholder="oficina@municipio.gob.ar"
            error={errors.email?.message}
            {...register('email')}
          />

          {/* Toggle permite_decision_final */}
          <div className="flex items-start gap-3 p-4 rounded bg-surface-container-low border border-outline-variant/30">
            <input
              id="permite_decision_final"
              type="checkbox"
              className="mt-0.5 w-4 h-4 rounded accent-primary cursor-pointer"
              {...register('permite_decision_final')}
            />
            <div>
              <label htmlFor="permite_decision_final" className="text-body-md text-on-surface font-medium cursor-pointer">
                Permite decisión final
              </label>
              <p className="text-label-sm text-on-surface-variant mt-0.5">
                Habilita a los jefes de esta oficina para tomar la decisión final sobre trámites.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link to="/oficinas">
              <Button variant="secondary" type="button">Cancelar</Button>
            </Link>
            <Button type="submit" isLoading={saving}>
              {isEdit ? 'Guardar Cambios' : 'Crear Oficina'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default OficinaForm;
