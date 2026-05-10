import { useForm } from 'react-hook-form';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import Button from '@components/atoms/Button';
import Textarea from '@components/atoms/Textarea';
import { cn } from '@utils/helpers';

const OPCIONES = [
  {
    value: 'aprobado',
    label: 'Aprobado',
    Icon: CheckCircleIcon,
    activeClass: 'bg-tertiary-fixed text-on-tertiary-fixed',
  },
  {
    value: 'observado',
    label: 'Observado',
    Icon: ExclamationCircleIcon,
    activeClass: 'bg-tertiary-container text-on-tertiary-container',
  },
];

/**
 * Formulario de evaluación de una sección de trámite.
 * onSubmit recibe: { resultado: 'aprobado' | 'observado', comentario: string }
 */
const EvaluacionSeccionForm = ({ seccion, onSubmit, isLoading, defaultValues }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues ?? { resultado: 'aprobado', comentario: '' },
  });

  const resultado = watch('resultado');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Sección header */}
      {seccion && (
        <div className="pb-4 border-b border-outline-variant/30">
          <p className="text-label-md text-on-surface-variant mb-0.5">Sección {seccion.orden}</p>
          <h3 className="text-title-md text-on-surface font-medium">{seccion.titulo}</h3>
          {seccion.descripcion && (
            <p className="text-body-sm text-on-surface-variant mt-1">{seccion.descripcion}</p>
          )}
        </div>
      )}

      {/* Resultado radio */}
      <div className="space-y-2">
        <p className="text-label-md text-on-surface-variant">Resultado</p>
        <div className="flex gap-3">
          {OPCIONES.map(({ value, label, Icon, activeClass }) => (
            <label
              key={value}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded cursor-pointer transition-all duration-150',
                resultado === value
                  ? activeClass
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              )}
            >
              <input type="radio" value={value} {...register('resultado')} className="sr-only" />
              <Icon className="h-5 w-5" />
              <span className="text-label-lg font-medium">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Comentario */}
      <Textarea
        label="Comentario"
        rows={3}
        placeholder={
          resultado === 'observado'
            ? 'Describí qué debe corregirse en esta sección...'
            : 'Observaciones adicionales (opcional)...'
        }
        error={errors.comentario?.message}
        helperText={resultado === 'observado' ? 'Requerido al observar' : undefined}
        {...register('comentario', {
          validate: (v) =>
            resultado !== 'observado' ||
            v.trim().length >= 10 ||
            'Mínimo 10 caracteres al observar',
        })}
      />

      <Button type="submit" isLoading={isLoading} className="w-full">
        Guardar evaluación
      </Button>
    </form>
  );
};

export default EvaluacionSeccionForm;
