import {
  BuildingOfficeIcon,
  UserIcon,
  CalendarIcon,
  HashtagIcon,
} from '@heroicons/react/24/outline';
import Card from '@components/atoms/Card';
import StatusPill from '@components/atoms/StatusPill';
import { formatDate } from '@utils/helpers';

const TramiteCard = ({ tramite, onClick }) => {
  return (
    <Card elevated onClick={() => onClick?.(tramite.id)}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <HashtagIcon className="h-3.5 w-3.5 text-on-surface-variant flex-shrink-0" />
              <span className="text-label-md text-on-surface-variant">{tramite.numero}</span>
            </div>
            <h3 className="text-title-md text-on-surface font-medium truncate">
              {tramite.tipo_tramite?.nombre ?? '—'}
            </h3>
          </div>
          <StatusPill status={tramite.estado} className="flex-shrink-0 mt-0.5" />
        </div>

        {/* Metadata */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
            <BuildingOfficeIcon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{tramite.empresa?.razon_social ?? '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
            <UserIcon className="h-4 w-4 flex-shrink-0" />
            <span>
              {tramite.solicitante
                ? `${tramite.solicitante.nombre} ${tramite.solicitante.apellido}`
                : '—'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
            <CalendarIcon className="h-4 w-4 flex-shrink-0" />
            <span>{formatDate(tramite.fecha_creacion)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TramiteCard;
