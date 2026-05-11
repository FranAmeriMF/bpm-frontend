import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useGetTramiteQuery, useFinalizarRevisionMutation, useIniciarRevisionMutation } from '@api/tramitesApi';
import { useGetProgresoQuery, useEvaluarSeccionMutation } from '@api/evaluacionesApi';
import { useAuth } from '@hooks/useAuth';
import { Button, Card, Spinner } from '@components/atoms';
import { EmptyState, Tabs } from '@components/molecules';
import { EvaluacionSeccionForm, HistorialTramite } from '@components/organisms';
import { cn, formatDate } from '@utils/helpers';

// ── Valor de campo readonly ────────────────────────────────────────────────────
const CampoValue = ({ valor }) => {
  if (valor === null || valor === undefined || valor === '') {
    return <span className="text-on-surface-variant italic">Sin dato</span>;
  }
  if (Array.isArray(valor)) return <span>{valor.join(', ')}</span>;
  if (typeof valor === 'boolean') return <span>{valor ? 'Sí' : 'No'}</span>;
  return <span>{String(valor)}</span>;
};

// ── Sección con datos + formulario de evaluación ───────────────────────────────
const SeccionRevision = ({ sec, evaluacion, onEvaluar }) => {
  const isAprobada = evaluacion?.aprobada === true;
  const isObservada = evaluacion?.aprobada === false;
  const evaluated = evaluacion !== null && evaluacion !== undefined;

  return (
    <Card elevated>
      <div className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-4 border-b border-outline-variant/30 pb-3">
          <div>
            {sec.seccion?.orden && (
              <p className="text-label-sm text-on-surface-variant mb-0.5">
                Sección {sec.seccion.orden}
              </p>
            )}
            <h3 className="text-title-md text-on-surface font-medium">
              {sec.seccion?.titulo ?? `Sección ${sec.seccion_id}`}
            </h3>
            {sec.seccion?.descripcion && (
              <p className="text-body-sm text-on-surface-variant mt-1">{sec.seccion.descripcion}</p>
            )}
          </div>
          {evaluated && (
            <span
              className={cn(
                'shrink-0 inline-flex items-center px-3 py-1 rounded-full text-label-md font-semibold',
                isAprobada ? 'bg-green-600 text-white' : 'bg-amber-500 text-white',
              )}
            >
              {isAprobada ? 'Aprobado' : 'Observado'}
            </span>
          )}
        </div>

        {(sec.campos ?? []).length > 0 && (
          <div>
            <p className="text-label-sm text-on-surface-variant font-medium uppercase tracking-wide mb-3">
              Datos presentados
            </p>
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
        )}

        {evaluated && isObservada && evaluacion.motivo_rechazo && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded p-3">
            <p className="text-label-sm text-amber-700 dark:text-amber-300 font-medium mb-1">Observación registrada</p>
            <p className="text-body-sm text-amber-900 dark:text-amber-200">{evaluacion.motivo_rechazo}</p>
          </div>
        )}

        {!evaluated && (
          <div className="border-t border-outline-variant/20 pt-4">
            <p className="text-label-sm text-on-surface-variant font-medium uppercase tracking-wide mb-3">
              Evaluación
            </p>
            <EvaluacionSeccionForm
              seccion={sec.seccion ?? { titulo: sec.seccion_id }}
              onSubmit={(data) => onEvaluar(data, sec.seccion_id)}
            />
          </div>
        )}
      </div>
    </Card>
  );
};

// ── Barra de progreso ──────────────────────────────────────────────────────────
const ProgresoBar = ({ evaluadas, total }) => {
  const pct = total > 0 ? Math.round((evaluadas / total) * 100) : 0;
  return (
    <Card elevated>
      <div className="p-4 space-y-2">
        <div className="flex justify-between text-label-md text-on-surface-variant">
          <span>Progreso de evaluación</span>
          <span className="font-medium text-on-surface">{evaluadas} / {total} secciones</span>
        </div>
        <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              pct === 100 ? 'bg-tertiary' : 'bg-primary',
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </Card>
  );
};

// ── Main page ──────────────────────────────────────────────────────────────────
const RevisarTramite = () => {
  const { tramite_id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: tramite, isLoading: tramiteLoading, isError } = useGetTramiteQuery(tramite_id);
  const [iniciarRevision, { isLoading: iniciando }] = useIniciarRevisionMutation();
  const [evaluarSeccion] = useEvaluarSeccionMutation();
  const [finalizarRevision, { isLoading: finalizando }] = useFinalizarRevisionMutation();

  const asignacion = (tramite?.asignaciones_oficinas ?? []).find(
    (a) => a.oficina_id === user?.oficina_id,
  );
  const asignacion_id = asignacion?.id;

  const { data: progreso, isLoading: progresoLoading } = useGetProgresoQuery(asignacion_id, {
    skip: !asignacion_id,
  });

  const handleEvaluar = async (data, seccion_id) => {
    try {
      await evaluarSeccion({
        asignacion_oficina_id: asignacion_id,
        seccion_id,
        aprobada: data.resultado === 'aprobado',
        motivo_rechazo: data.resultado !== 'aprobado' ? data.comentario : undefined,
        evaluado_por: user.id,
      }).unwrap();
      toast.success('Sección evaluada');
    } catch (err) {
      toast.error(err.data?.message ?? 'Error al evaluar');
    }
  };

  const handleIniciar = async () => {
    try {
      await iniciarRevision(tramite_id).unwrap();
      toast.success('Revisión iniciada');
    } catch (err) {
      toast.error(err.data?.message ?? 'Error al iniciar');
    }
  };

  const handleFinalizar = async () => {
    try {
      await finalizarRevision(tramite_id).unwrap();
      toast.success('Revisión de oficina aprobada');
      navigate('/revisiones');
    } catch (err) {
      toast.error(err.data?.message ?? 'Error al finalizar');
    }
  };

  if (tramiteLoading) {
    return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  }

  if (!tramite || isError) {
    return (
      <EmptyState
        title="Trámite no encontrado"
        description="El trámite no existe o no tenés acceso."
        action={{ label: 'Volver a Mis Revisiones', onClick: () => navigate('/revisiones') }}
      />
    );
  }

  if (!user?.oficina_id) {
    return (
      <div className="space-y-4 max-w-2xl">
        <Link to="/revisiones" className="text-label-sm text-on-surface-variant hover:underline">
          ← Mis Revisiones
        </Link>
        <Card elevated>
          <div className="p-6 space-y-3">
            <p className="text-title-sm text-on-surface font-medium">Sesión desactualizada</p>
            <p className="text-body-sm text-on-surface-variant">
              Tu sesión no tiene los datos de tu oficina. Cerrá sesión e ingresá nuevamente para continuar.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (!asignacion) {
    return (
      <div className="space-y-4 max-w-2xl">
        <Link to="/revisiones" className="text-label-sm text-on-surface-variant hover:underline">
          ← Mis Revisiones
        </Link>
        <Card elevated>
          <div className="p-6">
            <p className="text-body-md text-on-surface-variant italic">
              Tu oficina no tiene asignación para este trámite.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (asignacion.estado === 'pendiente') {
    return (
      <div className="space-y-6 max-w">
        <div>
          <Link to="/revisiones" className="text-label-sm text-on-surface-variant hover:underline">
            ← Mis Revisiones
          </Link>
          <h1 className="text-display-sm text-primary font-semibold mt-1">
            Revisar #{tramite.numero}
          </h1>
          <p className="text-body-md text-on-surface-variant">{tramite.tipo_tramite?.nombre}</p>
        </div>
        <Card elevated>
          <div className="p-6 text-center space-y-4">
            <p className="text-body-md text-on-surface-variant">
              La revisión aún no fue iniciada por tu oficina.
            </p>
            <Button onClick={handleIniciar} isLoading={iniciando}>
              Iniciar Revisión
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const detalle  = progreso?.detalle ?? [];
  const total    = progreso?.total_secciones ?? (tramite.secciones_datos?.length ?? 0);
  const evaluadas = progreso?.evaluadas ?? 0;
  const completo  = progreso?.completada ?? false;

  const secciones = (tramite.secciones_datos ?? []).map((sec) => {
    const ev = detalle.find((e) => e.seccion_id === sec.seccion_id) ?? null;
    return { ...sec, evaluacion: ev };
  });

  const historial = tramite.historial ?? [];

  const tabRevision = (
    <div className="space-y-4">
      {!progresoLoading && <ProgresoBar evaluadas={evaluadas} total={total} />}

      {secciones.length === 0 ? (
        <Card elevated>
          <div className="p-6">
            <p className="text-body-md text-on-surface-variant italic">
              Este trámite no tiene secciones con datos cargados.
            </p>
          </div>
        </Card>
      ) : (
        secciones.map((sec) => (
          <SeccionRevision
            key={sec.id}
            sec={sec}
            evaluacion={sec.evaluacion}
            onEvaluar={handleEvaluar}
          />
        ))
      )}

      {completo && user?.rol === 'jefe_oficina' && asignacion.estado !== 'completada' && (
        <div className="flex justify-end pt-2">
          <Button onClick={handleFinalizar} isLoading={finalizando}>
            Aprobar Revisión de Oficina
          </Button>
        </div>
      )}

      {completo && user?.rol === 'interno' && (
        <Card elevated>
          <div className="p-4 text-center text-body-sm text-on-surface-variant">
            Evaluación completa. El jefe de oficina debe aprobar para finalizar.
          </div>
        </Card>
      )}

      {asignacion.estado === 'completada' && (
        <Card elevated>
          <div className="p-4 text-center text-body-sm text-tertiary font-medium">
            Revisión de esta oficina completada.
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w">
      <div>
        <Link to="/revisiones" className="text-label-sm text-on-surface-variant hover:underline">
          ← Mis Revisiones
        </Link>
        <h1 className="text-display-sm text-primary font-semibold mt-1">
          Revisar #{tramite.numero}
        </h1>
        <p className="text-body-md text-on-surface-variant">{tramite.tipo_tramite?.nombre}</p>
      </div>

      <Card elevated>
        <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-4 text-body-sm">
          <div>
            <p className="text-label-sm text-on-surface-variant">Empresa</p>
            <p className="text-on-surface font-medium mt-0.5">{tramite.empresa?.razon_social}</p>
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant">Solicitante</p>
            <p className="text-on-surface font-medium mt-0.5">
              {tramite.solicitante?.nombre} {tramite.solicitante?.apellido}
            </p>
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant">Fecha creación</p>
            <p className="text-on-surface font-medium mt-0.5">
              {tramite.fecha_creacion ? formatDate(tramite.fecha_creacion, 'dd/MM/yyyy') : '—'}
            </p>
          </div>
        </div>
      </Card>

      <Tabs
        tabs={[
          { id: 'revision',  label: 'Revisión',                           content: tabRevision },
          { id: 'historial', label: `Historial (${historial.length})`,    content: <HistorialTramite historial={historial} defaultOpen /> },
        ]}
      />
    </div>
  );
};

export default RevisarTramite;
