import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  useGetTramiteQuery,
  useEnviarDirectorMutation,
  useAprobarDirectorMutation,
  useRechazarDirectorMutation,
  useIniciarCorreccionMutation,
} from '@api/tramitesApi';
import { useAuth } from '@hooks/useAuth';
import { Button, Card, Spinner, StatusPill } from '@components/atoms';
import { EmptyState, Tabs } from '@components/molecules';
import { HistorialTramite } from '@components/organisms';
import { formatDate } from '@utils/helpers';

// ── Read-only value display ────────────────────────────────────────────────────
const CampoValue = ({ valor }) => {
  if (valor === null || valor === undefined || valor === '') {
    return <span className="text-on-surface-variant italic">Sin dato</span>;
  }
  if (typeof valor === 'boolean') return <span>{valor ? 'Sí' : 'No'}</span>;
  return <span>{String(valor)}</span>;
};

// ── Estado de asignación por oficina ─────────────────────────────────────────
const ASIGNACION_ESTADO = {
  pendiente:   { label: 'Pendiente',   cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  en_revision: { label: 'En revisión', cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  completada:  { label: 'Completada',  cls: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
};

const AsignacionBadge = ({ estado }) => {
  const cfg = ASIGNACION_ESTADO[estado] ?? ASIGNACION_ESTADO.pendiente;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

// ── Decisión final ────────────────────────────────────────────────────────────
const DECISION_CONFIG = {
  aprobado:  { label: 'Aprobado',  bg: 'bg-green-50 dark:bg-green-950/30',  border: 'border-green-500',  badge: 'bg-green-600 text-white' },
  observado: { label: 'Observado', bg: 'bg-amber-50 dark:bg-amber-950/30',  border: 'border-amber-500',  badge: 'bg-amber-500 text-white' },
  rechazado: { label: 'Rechazado', bg: 'bg-red-50 dark:bg-red-950/30',      border: 'border-red-500',    badge: 'bg-red-600 text-white'   },
};

const DecisionFinalCard = ({ df, decisor, secciones }) => {
  const cfg = DECISION_CONFIG[df.decision] ?? DECISION_CONFIG.rechazado;
  const seccionesCorregir = (df.secciones_a_corregir ?? []).map((sid) => {
    const match = secciones.find((s) => s.seccion_id === sid);
    return match?.seccion?.titulo ?? sid;
  });

  return (
    <Card elevated>
      <div className={`p-5 space-y-4 rounded ${cfg.bg} border-l-4 ${cfg.border}`}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-label-sm text-on-surface-variant mb-1">Decisión Final</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-label-md font-semibold ${cfg.badge}`}>
              {cfg.label}
            </span>
          </div>
          <div className="text-right">
            {df.fecha_decision && (
              <p className="text-label-sm text-on-surface-variant tabular-nums">
                {formatDate(df.fecha_decision, "dd/MM/yyyy 'a las' HH:mm")}
              </p>
            )}
            {decisor && (
              <p className="text-label-sm text-on-surface font-medium mt-0.5">
                {decisor.nombre} {decisor.apellido}
              </p>
            )}
          </div>
        </div>

        <div>
          <p className="text-label-sm text-on-surface-variant font-medium mb-1">
            Mensaje al solicitante
          </p>
          <p className="text-body-sm text-on-surface bg-surface rounded px-3 py-2 whitespace-pre-wrap">
            {df.mensaje_al_solicitante}
          </p>
        </div>

        {seccionesCorregir.length > 0 && (
          <div>
            <p className="text-label-sm text-on-surface-variant font-medium mb-2">
              Secciones a corregir ({seccionesCorregir.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {seccionesCorregir.map((titulo) => (
                <span
                  key={titulo}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm font-medium bg-tertiary-container text-on-tertiary-container"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container/60 shrink-0" />
                  {titulo}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// ── Rechazar inline form ───────────────────────────────────────────────────────
const RechazarForm = ({ onConfirm, onCancel, isLoading }) => {
  const [obs, setObs] = useState('');
  return (
    <Card elevated>
      <div className="p-6 space-y-4">
        <h3 className="text-title-md text-on-surface font-medium">Rechazar trámite</h3>
        <p className="text-body-sm text-on-surface-variant">
          El solicitante recibirá una notificación con las observaciones.
        </p>
        <textarea
          className="w-full rounded p-3 text-body-sm bg-surface border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          rows={3}
          placeholder="Motivo del rechazo (opcional)..."
          value={obs}
          onChange={(e) => setObs(e.target.value)}
        />
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="error" onClick={() => onConfirm(obs)} isLoading={isLoading}>
            Confirmar Rechazo
          </Button>
        </div>
      </div>
    </Card>
  );
};

// ── Main page ──────────────────────────────────────────────────────────────────
const TramiteDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rechazarOpen, setRechazarOpen] = useState(false);

  const { data: tramite, isLoading, isError } = useGetTramiteQuery(id);
  const [enviarDirector, { isLoading: enviando }] = useEnviarDirectorMutation();
  const [aprobarDirector, { isLoading: aprobando }] = useAprobarDirectorMutation();
  const [rechazarDirector, { isLoading: rechazando }] = useRechazarDirectorMutation();
  const [iniciarCorreccion, { isLoading: iniciando }] = useIniciarCorreccionMutation();

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!tramite || isError) {
    return <EmptyState title="Trámite no encontrado" description="El trámite no existe o no tenés acceso." />;
  }

  const { estado } = tramite;
  const isOwner = tramite.solicitante?.id === user?.id;

  const handle = (mutation, successMsg, then) => async (...args) => {
    try {
      await mutation(...args).unwrap();
      toast.success(successMsg);
      then?.();
    } catch (err) {
      toast.error(err.data?.message ?? 'Error inesperado');
    }
  };

  const onEnviar = handle(enviarDirector, 'Trámite enviado al Director');
  const onAprobar = handle(aprobarDirector, 'Trámite aprobado');
  const onRechazar = (obs) =>
    handle(rechazarDirector, 'Trámite rechazado', () => setRechazarOpen(false))({ id, observaciones: obs });
  const onIniciarCorreccion = handle(
    iniciarCorreccion,
    'Corrección iniciada',
    () => navigate(`/tramites/${id}/editar`),
  );

  const historial = tramite.historial ?? [];
  const secciones = tramite.secciones_datos ?? [];
  const asignaciones = tramite.asignaciones_oficinas ?? [];

  const tabAsignacion = (
    <div className="space-y-4">
      {tramite.jefe_decisor ? (
        <Card elevated>
          <div className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary text-label-md font-semibold select-none">
              {tramite.jefe_decisor.nombre?.[0]}{tramite.jefe_decisor.apellido?.[0]}
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant">Usuario Decisor Final</p>
              <p className="text-body-md text-on-surface font-medium">
                {tramite.jefe_decisor.nombre} {tramite.jefe_decisor.apellido}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <p className="text-body-md text-on-surface-variant italic">Sin decisor asignado.</p>
      )}

      {asignaciones.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {asignaciones.map((asig) => (
            <Card key={asig.id} elevated>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-body-md text-on-surface font-medium">
                    {asig.oficina?.nombre ?? '—'}
                  </p>
                  <AsignacionBadge estado={asig.estado} />
                </div>
                {asig.jefe_asignado && (
                  <p className="text-label-sm text-on-surface-variant">
                    Revisado por: {asig.jefe_asignado.nombre} {asig.jefe_asignado.apellido}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-body-md text-on-surface-variant italic">Sin oficinas asignadas.</p>
      )}
    </div>
  );

  const tabDatos = (
    <div className="space-y-6">
      {/* Action buttons */}
      {!rechazarOpen && (
        <div className="flex flex-wrap gap-3">
          {isOwner && estado === 'borrador' && (
            <>
              <Button onClick={() => onEnviar(id)} isLoading={enviando}>
                Enviar al Director
              </Button>
              <Link to={`/tramites/${id}/editar`}>
                <Button variant="secondary">Editar</Button>
              </Link>
            </>
          )}
          {isOwner && estado === 'observado' && (
            <Button onClick={() => onIniciarCorreccion(id)} isLoading={iniciando}>
              Iniciar Corrección
            </Button>
          )}
          {isOwner && estado === 'corrigiendo' && (
            <Link to={`/tramites/${id}/editar`}>
              <Button>Corregir y Reenviar</Button>
            </Link>
          )}
          {user?.rol === 'director' && estado === 'en_revision_interna' && (
            <>
              <Button onClick={() => onAprobar(id)} isLoading={aprobando}>
                Aprobar
              </Button>
              <Button variant="error" onClick={() => setRechazarOpen(true)}>
                Rechazar
              </Button>
            </>
          )}
        </div>
      )}

      {rechazarOpen && (
        <RechazarForm
          onConfirm={onRechazar}
          onCancel={() => setRechazarOpen(false)}
          isLoading={rechazando}
        />
      )}

      {tramite.decision_final && (
        <DecisionFinalCard
          df={tramite.decision_final}
          decisor={tramite.jefe_decisor}
          secciones={secciones}
        />
      )}

      <div className="space-y-4">
        <h2 className="text-title-lg text-on-surface font-medium">Datos del Formulario</h2>
        {secciones.length === 0 ? (
          <p className="text-body-md text-on-surface-variant italic">Sin datos de formulario.</p>
        ) : (
          secciones.map((sec) => (
            <Card key={sec.id} elevated>
              <div className="p-6 space-y-4">
                <h3 className="text-title-md text-on-surface font-medium border-b border-outline-variant/30 pb-2">
                  {sec.seccion?.titulo ?? `Sección ${sec.seccion_id}`}
                </h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                  {(sec.campos ?? []).map((c) => (
                    <div key={c.id}>
                      <dt className="text-label-sm text-on-surface-variant">
                        {c.campo?.etiqueta ?? c.campo_id}
                      </dt>
                      <dd className="text-body-md text-on-surface mt-0.5">
                        <CampoValue valor={c.valor} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w">
      {/* Breadcrumb + title */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/tramites" className="text-label-sm text-on-surface-variant hover:underline">
            ← Trámites
          </Link>
          <h1 className="text-display-sm text-primary font-semibold mt-1">
            #{tramite.numero}
          </h1>
          <p className="text-body-md text-on-surface-variant">{tramite.tipo_tramite?.nombre}</p>
        </div>
        <StatusPill status={estado} />
      </div>

      {/* Info grid */}
      <Card elevated>
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Empresa', value: tramite.empresa?.razon_social },
            {
              label: 'Solicitante',
              value: `${tramite.solicitante?.nombre ?? ''} ${tramite.solicitante?.apellido ?? ''}`.trim(),
            },
            {
              label: 'Creado',
              value: tramite.fecha_creacion
                ? formatDate(tramite.fecha_creacion, 'dd/MM/yyyy')
                : '—',
            },
            {
              label: 'Actualizado',
              value: tramite.updated_at
                ? formatDate(tramite.updated_at, 'dd/MM/yyyy HH:mm')
                : '—',
            },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-label-sm text-on-surface-variant">{label}</p>
              <p className="text-body-md text-on-surface font-medium mt-0.5">{value || '—'}</p>
            </div>
          ))}
        </div>
      </Card>

      <Tabs
        tabs={[
          { id: 'datos',      label: 'Datos del Trámite', content: tabDatos },
          { id: 'asignacion', label: `Oficinas (${asignaciones.length})`, content: tabAsignacion },
          { id: 'historial',  label: `Historial (${historial.length})`, content: <HistorialTramite historial={historial} defaultOpen /> },
        ]}
      />
    </div>
  );
};

export default TramiteDetalle;
