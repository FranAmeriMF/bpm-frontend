import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { Card, StatusPill } from '@components/atoms';
import { formatDate } from '@utils/helpers';

const ROL_LABEL = {
  solicitante:  'Solicitante',
  director:     'Director',
  moderador:    'Moderador',
  jefe_oficina: 'Jefe de Oficina',
  interno:      'Revisor Interno',
  admin:        'Administrador',
};

const HistorialEntry = ({ h, isLast }) => {
  const nombre = h.usuario ? `${h.usuario.nombre} ${h.usuario.apellido}` : null;
  const rol    = h.usuario?.rol ? (ROL_LABEL[h.usuario.rol] ?? h.usuario.rol) : null;
  const email  = h.usuario?.email ?? null;

  return (
    <div className="flex gap-4">
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center pt-5">
        <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
        {!isLast && <div className="w-px flex-1 bg-outline-variant/40 mt-1" />}
      </div>

      <Card elevated className="flex-1 mb-3">
        <div className="px-4 py-3 space-y-2">
          {/* Estado + fecha */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {h.estado_anterior && (
                <>
                  <StatusPill status={h.estado_anterior} />
                  <span className="text-on-surface-variant text-label-sm">→</span>
                </>
              )}
              <StatusPill status={h.estado_nuevo} />
            </div>
            <p className="text-label-sm text-on-surface-variant shrink-0 tabular-nums">
              {h.fecha_cambio ? formatDate(h.fecha_cambio, "dd/MM/yyyy 'a las' HH:mm") : '—'}
            </p>
          </div>

          {/* Usuario */}
          {nombre && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-label-sm text-on-surface-variant">Por</span>
              <span className="text-label-sm font-medium text-on-surface">{nombre}</span>
              {rol && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm bg-surface-container text-on-surface-variant">
                  {rol}
                </span>
              )}
              {email && (
                <span className="text-label-sm text-on-surface-variant/60">{email}</span>
              )}
            </div>
          )}

          {/* Comentario */}
          {h.comentario && (
            <p className="text-body-sm text-on-surface bg-surface-container-low rounded px-3 py-2 border-l-2 border-primary/40">
              {h.comentario}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

/**
 * Muestra el historial de estados de un trámite.
 * defaultOpen: si el acordeón arranca expandido (default: false).
 */
const HistorialTramite = ({ historial = [], defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full group"
      >
        <h2 className="text-title-lg text-on-surface font-medium group-hover:text-primary transition-colors">
          Historial de Estados
          {historial.length > 0 && (
            <span className="ml-2 text-label-md text-on-surface-variant font-normal">
              ({historial.length})
            </span>
          )}
        </h2>
        {open
          ? <ChevronUpIcon className="h-5 w-5 text-on-surface-variant" />
          : <ChevronDownIcon className="h-5 w-5 text-on-surface-variant" />}
      </button>

      {open && (
        historial.length === 0 ? (
          <p className="text-body-md text-on-surface-variant italic">Sin historial.</p>
        ) : (
          <div className="space-y-0">
            {historial.map((h, idx) => (
              <HistorialEntry key={h.id} h={h} isLast={idx === historial.length - 1} />
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default HistorialTramite;
