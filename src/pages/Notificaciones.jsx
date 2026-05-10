import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  TrashIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import {
  useGetNotificacionesQuery,
  useMarcarLeidaMutation,
  useMarcarTodasLeidasMutation,
  useDeleteNotificacionMutation,
} from '@api/notificacionesApi';
import { Button, Card, Spinner } from '@components/atoms';
import { cn, formatDate } from '@utils/helpers';

// ── Config por tipo ────────────────────────────────────────────────────────────
const TIPO_CONFIG = {
  info:    { Icon: InformationCircleIcon, color: 'text-primary',            bg: 'bg-primary/10',            label: 'Info' },
  success: { Icon: CheckCircleIcon,       color: 'text-tertiary',           bg: 'bg-tertiary/10',           label: 'Éxito' },
  warning: { Icon: ExclamationTriangleIcon, color: 'text-tertiary-container', bg: 'bg-tertiary-container/20', label: 'Atención' },
  error:   { Icon: XCircleIcon,           color: 'text-error',              bg: 'bg-error-container/20',    label: 'Error' },
};

// 'todas' | 'no_leidas' | 'leidas'
const FILTROS_LECTURA = [
  { key: 'todas',     label: 'Todas' },
  { key: 'no_leidas', label: 'No leídas' },
  { key: 'leidas',    label: 'Leídas' },
];

const leidaParam = { todas: undefined, no_leidas: false, leidas: true };

// ── Card de una notificación ───────────────────────────────────────────────────
const NotificacionCard = ({ notif, onMarcarLeida, onEliminar }) => {
  const cfg = TIPO_CONFIG[notif.tipo] ?? TIPO_CONFIG.info;
  const { Icon } = cfg;

  const destino = notif.accion_url
    ? notif.accion_url
    : notif.tramite?.id
    ? `/tramites/${notif.tramite.id}`
    : null;

  return (
    <Card elevated className={cn(!notif.leida && 'ring-1 ring-primary/20')}>
      <div className="p-4 flex gap-4">
        {/* Icono tipo */}
        <div className={cn('shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-0.5', cfg.bg)}>
          <Icon className={cn('w-5 h-5', cfg.color)} />
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={cn('text-body-md', notif.leida ? 'text-on-surface-variant' : 'text-on-surface font-semibold')}>
                {notif.titulo}
              </p>
              {!notif.leida && (
                <span className="inline-block w-2 h-2 rounded-full bg-primary shrink-0" />
              )}
              <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-medium', cfg.bg, cfg.color)}>
                {cfg.label}
              </span>
            </div>
            <p className="text-label-sm text-on-surface-variant/60 shrink-0 tabular-nums">
              {notif.fecha_creacion ? formatDate(notif.fecha_creacion, 'dd/MM/yyyy HH:mm') : '—'}
            </p>
          </div>

          <p className="text-body-sm text-on-surface-variant">{notif.mensaje}</p>

          {/* Tramite vinculado */}
          {notif.tramite && (
            <p className="text-label-sm text-on-surface-variant">
              Trámite:{' '}
              <Link
                to={`/tramites/${notif.tramite.id}`}
                className="text-primary hover:underline font-medium"
              >
                #{notif.tramite.numero}
              </Link>
            </p>
          )}

          {/* Fecha lectura */}
          {notif.leida && notif.fecha_lectura && (
            <p className="text-label-sm text-on-surface-variant/50">
              Leída el {formatDate(notif.fecha_lectura, 'dd/MM/yyyy HH:mm')}
            </p>
          )}

          {/* Acciones */}
          <div className="flex items-center gap-3 pt-1">
            {destino && (
              <Link
                to={destino}
                className="text-label-sm text-primary hover:underline font-medium"
              >
                Ver detalle →
              </Link>
            )}
            {!notif.leida && (
              <button
                onClick={() => onMarcarLeida(notif.id)}
                className="flex items-center gap-1 text-label-sm text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <CheckIcon className="w-3.5 h-3.5" />
                Marcar como leída
              </button>
            )}
            <button
              onClick={() => onEliminar(notif.id)}
              className="flex items-center gap-1 text-label-sm text-error/70 hover:text-error transition-colors ml-auto"
            >
              <TrashIcon className="w-3.5 h-3.5" />
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

// ── Page principal ─────────────────────────────────────────────────────────────
const Notificaciones = () => {
  const [filtroLeida, setFiltroLeida] = useState('todas');
  const [filtroTipo, setFiltroTipo] = useState('');

  const leida = leidaParam[filtroLeida];

  const { data, isLoading } = useGetNotificacionesQuery(
    {
      ...(leida !== undefined && { leida }),
      ...(filtroTipo && { tipo: filtroTipo }),
      limit: 50,
    },
    { pollingInterval: 30_000 },
  );

  const [marcarLeida] = useMarcarLeidaMutation();
  const [marcarTodas] = useMarcarTodasLeidasMutation();
  const [eliminar]    = useDeleteNotificacionMutation();

  const lista      = data?.data ?? [];
  const total      = data?.total ?? 0;
  const noLeidas   = lista.filter((n) => !n.leida).length;
  const tiposEnUso = [...new Set(lista.map((n) => n.tipo))];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-display-sm text-primary font-semibold">Notificaciones</h1>
          <p className="text-body-md text-on-surface-variant mt-0.5">
            {total} en total{noLeidas > 0 && ` · ${noLeidas} sin leer`}
          </p>
        </div>
        {noLeidas > 0 && (
          <Button variant="secondary" size="sm" onClick={() => marcarTodas()}>
            <CheckIcon className="w-4 h-4 mr-1.5" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {/* Filtros de lectura */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex rounded border border-outline-variant overflow-hidden">
          {FILTROS_LECTURA.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFiltroLeida(key)}
              className={cn(
                'px-3 py-1.5 text-label-sm transition-colors',
                filtroLeida === key
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Filtros por tipo */}
        {tiposEnUso.length > 1 && (
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setFiltroTipo('')}
              className={cn(
                'px-3 py-1.5 rounded-full text-label-sm border transition-colors',
                filtroTipo === ''
                  ? 'bg-surface-container-high text-on-surface border-outline-variant'
                  : 'border-outline-variant/50 text-on-surface-variant hover:bg-surface-container',
              )}
            >
              Todos los tipos
            </button>
            {tiposEnUso.map((tipo) => {
              const cfg = TIPO_CONFIG[tipo] ?? TIPO_CONFIG.info;
              return (
                <button
                  key={tipo}
                  onClick={() => setFiltroTipo(filtroTipo === tipo ? '' : tipo)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-label-sm border transition-colors',
                    filtroTipo === tipo
                      ? cn(cfg.bg, cfg.color, 'border-transparent font-medium')
                      : 'border-outline-variant/50 text-on-surface-variant hover:bg-surface-container',
                  )}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : lista.length === 0 ? (
        <Card elevated>
          <div className="p-10 text-center">
            <InformationCircleIcon className="w-10 h-10 text-on-surface-variant/40 mx-auto mb-3" />
            <p className="text-body-md text-on-surface-variant italic">
              {filtroLeida === 'no_leidas'
                ? 'No tenés notificaciones sin leer.'
                : filtroLeida === 'leidas'
                ? 'No tenés notificaciones leídas.'
                : 'No tenés notificaciones.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {lista.map((n) => (
            <NotificacionCard
              key={n.id}
              notif={n}
              onMarcarLeida={(id) => marcarLeida(id)}
              onEliminar={(id) => eliminar(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Notificaciones;
