import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import {
  useGetPlantillaQuery,
  useCreatePlantillaMutation,
  useUpdatePlantillaMutation,
} from '@api/plantillasApi';
import { useGetOficinasQuery } from '@api/oficinasApi';
import { Button, Card, Input, Spinner } from '@components/atoms';

const TIPOS = [
  { value: 'aprobado',  label: 'Aprobación' },
  { value: 'rechazado', label: 'Rechazo' },
  { value: 'observado', label: 'Observación' },
];

const VARIABLES = [
  '[NOMBRE_SOLICITANTE]',
  '[NUMERO_TRAMITE]',
  '[TIPO_TRAMITE]',
  '[EMPRESA]',
];

const schema = yup.object({
  nombre:        yup.string().required('Requerido'),
  oficina_id:    yup.string().required('La oficina es obligatoria'),
  tipo_decision: yup.string().required('Requerido'),
  contenido:     yup.string().required('El contenido no puede estar vacío'),
});

const PlantillaForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: plantilla, isLoading: loadingPlantilla } = useGetPlantillaQuery(id, { skip: !isEdit });
  const { data: oficinasData } = useGetOficinasQuery({ limit: 100 });
  const oficinas = oficinasData?.data ?? [];

  const [createPlantilla, { isLoading: creating }] = useCreatePlantillaMutation();
  const [updatePlantilla, { isLoading: updating }]  = useUpdatePlantillaMutation();
  const saving = creating || updating;

  const { register, handleSubmit, reset, setValue, getValues, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { tipo_decision: 'aprobado', oficina_id: '' },
  });

  useEffect(() => {
    if (plantilla) {
      reset({
        nombre:        plantilla.nombre        ?? '',
        oficina_id:    plantilla.oficina_id    ?? '',
        tipo_decision: plantilla.tipo_decision ?? 'aprobado',
        contenido:     plantilla.contenido     ?? '',
      });
    }
  }, [plantilla, reset]);

  const insertVariable = (variable) => {
    const current = getValues('contenido');
    setValue('contenido', current + variable, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updatePlantilla({ id, ...data }).unwrap();
        toast.success('Plantilla actualizada');
      } else {
        const created = await createPlantilla(data).unwrap();
        toast.success('Plantilla creada');
        navigate(`/plantillas/${created.id}/editar`, { replace: true });
      }
    } catch (err) {
      toast.error(err.data?.message ?? 'Error al guardar');
    }
  };

  if (isEdit && loadingPlantilla) {
    return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link to="/plantillas" className="text-label-sm text-on-surface-variant hover:underline">
          ← Plantillas de Mensaje
        </Link>
        <h1 className="text-display-sm text-primary font-semibold mt-1">
          {isEdit ? 'Editar Plantilla' : 'Nueva Plantilla'}
        </h1>
        {isEdit && plantilla && (
          <p className="text-body-md text-on-surface-variant">{plantilla.nombre}</p>
        )}
      </div>

      <Card elevated>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">

          <Input
            label="Nombre"
            required
            placeholder="Ej: Aprobación Estándar"
            error={errors.nombre?.message}
            {...register('nombre')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Oficina */}
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1.5 font-medium">
                Oficina <span className="text-error">*</span>
              </label>
              <select
                {...register('oficina_id')}
                className="w-full h-10 px-3 rounded border border-outline-variant bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">Seleccioná una oficina</option>
                {oficinas.map((o) => (
                  <option key={o.id} value={o.id}>{o.nombre}</option>
                ))}
              </select>
              {errors.oficina_id && (
                <p className="mt-1 text-label-sm text-error">{errors.oficina_id.message}</p>
              )}
            </div>

            {/* Tipo de decisión */}
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1.5 font-medium">
                Tipo de Decisión <span className="text-error">*</span>
              </label>
              <select
                {...register('tipo_decision')}
                className="w-full h-10 px-3 rounded border border-outline-variant bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {errors.tipo_decision && (
                <p className="mt-1 text-label-sm text-error">{errors.tipo_decision.message}</p>
              )}
            </div>
          </div>

          {/* Contenido */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1.5 font-medium">
              Contenido <span className="text-error">*</span>
            </label>

            {/* Variable helpers */}
            <div className="flex flex-wrap gap-2 mb-2">
              {VARIABLES.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => insertVariable(v)}
                  className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-container text-label-sm font-mono hover:bg-primary/20 transition-colors"
                >
                  {v}
                </button>
              ))}
            </div>

            <textarea
              {...register('contenido')}
              rows={8}
              placeholder="Estimado [NOMBRE_SOLICITANTE], nos comunicamos para informarle que su trámite [NUMERO_TRAMITE]..."
              className="w-full px-3 py-2 rounded border border-outline-variant bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y font-mono text-sm"
            />
            {errors.contenido && (
              <p className="mt-1 text-label-sm text-error">{errors.contenido.message}</p>
            )}
            <p className="mt-1.5 text-label-sm text-on-surface-variant">
              Usá los botones de arriba para insertar variables que se reemplazarán automáticamente al enviar.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link to="/plantillas">
              <Button variant="secondary" type="button">Cancelar</Button>
            </Link>
            <Button type="submit" isLoading={saving}>
              {isEdit ? 'Guardar Cambios' : 'Crear Plantilla'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PlantillaForm;
