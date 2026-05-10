import { cn } from '@utils/helpers';

const statusConfig = {
  borrador: {
    bg: 'bg-surface-container-high',
    text: 'text-on-surface-variant',
    label: 'Borrador',
  },
  en_revision_interna: {
    bg: 'bg-secondary-container',
    text: 'text-on-secondary-container',
    label: 'Revisión Interna',
  },
  pendiente_asignacion: {
    bg: 'bg-tertiary-container',
    text: 'text-on-tertiary-container',
    label: 'Pendiente Asignación',
  },
  asignado: {
    bg: 'bg-blue-600',
    text: 'text-white',
    label: 'Asignado',
  },
  en_revision: {
    bg: 'bg-blue-500',
    text: 'text-white',
    label: 'En Revisión',
  },
  en_revision_final: {
    bg: 'bg-purple-600',
    text: 'text-white',
    label: 'Decisión Pendiente',
  },
  aprobado: {
    bg: 'bg-green-600',
    text: 'text-white',
    label: 'Aprobado',
  },
  rechazado: {
    bg: 'bg-red-600',
    text: 'text-white',
    label: 'Rechazado',
  },
  observado: {
    bg: 'bg-amber-500',
    text: 'text-white',
    label: 'Observado',
  },
  corrigiendo: {
    bg: 'bg-secondary-container',
    text: 'text-on-secondary-container',
    label: 'Corrigiendo',
  },
};

const StatusPill = ({ status, className }) => {
  const config = statusConfig[status] ?? statusConfig.borrador;

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-label-md font-medium',
        config.bg,
        config.text,
        className
      )}
    >
      {config.label}
    </span>
  );
};

export default StatusPill;
