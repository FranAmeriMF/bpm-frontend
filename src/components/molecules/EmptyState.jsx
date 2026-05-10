import { InboxIcon } from '@heroicons/react/24/outline';
import Button from '@components/atoms/Button';
import { cn } from '@utils/helpers';

/**
 * Estado vacío para listas sin resultados.
 * action: { label: string, onClick: fn, variant?: string }
 */
const EmptyState = ({ title = 'Sin resultados', description, action, icon: Icon, className }) => {
  const IconComponent = Icon ?? InboxIcon;

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4', className)}>
      <div className="p-4 bg-surface-container rounded-full mb-4">
        <IconComponent className="h-12 w-12 text-on-surface-variant" />
      </div>
      <h3 className="text-title-lg text-on-surface font-medium text-center">{title}</h3>
      {description && (
        <p className="text-body-md text-on-surface-variant text-center mt-2 max-w-sm">{description}</p>
      )}
      {action && (
        <div className="mt-6">
          <Button variant={action.variant ?? 'primary'} onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
