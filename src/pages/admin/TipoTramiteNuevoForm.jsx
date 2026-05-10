import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useCreateTipoTramiteMutation } from '@api/tiposTramiteApi';
import { Button, Card, Input } from '@components/atoms';

const schema = yup.object({
  nombre:      yup.string().min(5, 'Mínimo 5 caracteres').max(100).required('Requerido'),
  descripcion: yup.string().min(20, 'Mínimo 20 caracteres').max(1000).required('Requerido'),
  codigo:      yup.string().max(20, 'Máximo 20 caracteres').required('Requerido'),
});

const TipoTramiteNuevoForm = () => {
  const navigate = useNavigate();
  const [createTipo, { isLoading }] = useCreateTipoTramiteMutation();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const nuevo = await createTipo(data).unwrap();
      toast.success('Tipo de trámite creado');
      navigate(`/tipos-tramite/${nuevo.id}/configurar`, { replace: true });
    } catch (err) {
      toast.error(err.data?.message ?? 'Error al crear');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link to="/tipos-tramite" className="text-label-sm text-on-surface-variant hover:underline">
          ← Tipos de Trámite
        </Link>
        <h1 className="text-display-sm text-primary font-semibold mt-1">Nuevo Tipo de Trámite</h1>
      </div>

      <Card elevated>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <Input
            label="Nombre"
            required
            placeholder="Ej: Habilitación Comercial"
            error={errors.nombre?.message}
            {...register('nombre')}
          />

          <div>
            <Input
              label="Código"
              required
              placeholder="Ej: HAB_COM"
              error={errors.codigo?.message}
              {...register('codigo')}
            />
            <p className="mt-1 text-label-sm text-on-surface-variant">
              Identificador corto único (máx 20 caracteres). No se puede modificar una vez creado.
            </p>
          </div>

          <div>
            <label className="block text-label-md text-on-surface-variant mb-1.5 font-medium">
              Descripción <span className="text-error">*</span>
            </label>
            <textarea
              {...register('descripcion')}
              rows={4}
              placeholder="Describí para qué sirve este trámite (mínimo 20 caracteres)"
              className="w-full px-3 py-2 rounded border border-outline-variant bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
            />
            {errors.descripcion && (
              <p className="mt-1 text-label-sm text-error">{errors.descripcion.message}</p>
            )}
          </div>

          <p className="text-label-sm text-on-surface-variant bg-surface-container-low rounded px-4 py-3">
            El tipo se creará en estado <strong>Borrador</strong>. Desde el configurador podrás agregar secciones y campos antes de activarlo.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Link to="/tipos-tramite">
              <Button variant="secondary" type="button">Cancelar</Button>
            </Link>
            <Button type="submit" isLoading={isLoading}>Crear y Configurar</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TipoTramiteNuevoForm;
