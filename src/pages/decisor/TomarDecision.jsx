import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useGetTramiteQuery, useDecisionFinalMutation } from '@api/tramitesApi';
import { useGetPlantillasQuery } from '@api/plantillasApi';
import { Button, Card, Spinner, StatusPill } from '@components/atoms';
import { Tabs } from '@components/molecules';
import { HistorialTramite } from '@components/organisms';
import { cn, formatDate } from '@utils/helpers';

// ── Valor de campo (read-only) ─────────────────────────────────────────────────
const CampoValue = ({ valor }) => {
  if (valor === null || valor === undefined || valor === '') {
    return <span className="text-on-surface-variant italic">Sin dato</span>;
  }
  if (Array.isArray(valor)) return <span>{valor.join(', ')}</span>;
  if (typeof valor === 'boolean') return <span>{valor ? 'Sí' : 'No'}</span>;
  return <span>{String(valor)}</span>;
};

// ── Panel colapsable de evaluaciones de una sección por todas las oficinas ─────
const EvaluacionesSeccion = ({ seccion, asignaciones }) => {
  const [abierto, setAbierto] = useState(true);

  const filas = asignaciones.flatMap((asig) => {
    const ev = (asig.evaluaciones_secciones ?? []).find(
      (e) => e.seccion_id === seccion.seccion_id,
    );
    if (!ev) return [];
    return [{
      oficina: asig.oficina?.nombre ?? '—',
      aprobada: ev.aprobada,
      motivo: ev.motivo_rechazo,
      evaluador: ev.evaluador
        ? `${ev.evaluador.nombre} ${ev.evaluador.apellido}`
        : '—',
      fecha: ev.fecha_evaluacion,
    }];
  });

  if (filas.length === 0) return null;

  return (
    <div className="mt-4 border-t border-outline-variant/20 pt-4">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex items-center justify-between w-full text-left group"
      >
        <p className="text-label-sm text-on-surface-variant font-medium uppercase tracking-wide">
          Evaluaciones por oficina
        </p>
        <span className="text-on-surface-variant/60 text-label-sm group-hover:text-on-surface transition-colors">
          {abierto ? '▲ Ocultar' : '▼ Ver'}
        </span>
      </button>

      {abierto && (
        <div className="space-y-2 mt-2">
          {filas.map((fila, i) => (
            <div
              key={i}
              className={cn(
                'rounded p-3 space-y-1 border',
                fila.aprobada
                  ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                  : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-label-md text-on-surface font-medium">{fila.oficina}</p>
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-semibold',
                    fila.aprobada ? 'bg-green-600 text-white' : 'bg-amber-500 text-white',
                  )}
                >
                  {fila.aprobada ? 'Aprobado' : 'Observado'}
                </span>
              </div>
              <p className="text-label-sm text-on-surface-variant">
                Evaluado por: <span className="text-on-surface">{fila.evaluador}</span>
                {fila.fecha && (
                  <span className="ml-2 text-on-surface-variant/60">
                    · {formatDate(fila.fecha, 'dd/MM/yyyy HH:mm')}
                  </span>
                )}
              </p>
              {fila.motivo && (
                <p className="text-body-sm text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/40 rounded p-2 mt-1">
                  {fila.motivo}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Sección colapsable: datos del formulario + evaluaciones ────────────────────
const SeccionConEvaluaciones = ({ sec, asignaciones }) => {
  const [abierto, setAbierto] = useState(false);

  const titulo = sec.seccion?.titulo ?? `Sección ${sec.seccion_id}`;
  const tieneCampos = (sec.campos ?? []).length > 0;

  // Indica si alguna oficina observó esta sección (para resaltarla en el header)
  const tieneObservacion = asignaciones.some((asig) =>
    (asig.evaluaciones_secciones ?? []).some(
      (e) => e.seccion_id === sec.seccion_id && !e.aprobada,
    ),
  );

  return (
    <Card elevated>
      {/* Header siempre visible — hace toggle */}
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left group"
      >
        <div>
          {sec.seccion?.orden && (
            <p className="text-label-sm text-on-surface-variant mb-0.5">
              Sección {sec.seccion.orden}
            </p>
          )}
          <h3 className="text-title-md text-on-surface font-medium">{titulo}</h3>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {tieneObservacion && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-semibold bg-amber-500 text-white">
              Con observaciones
            </span>
          )}
          <span className="text-on-surface-variant/60 text-label-sm group-hover:text-on-surface transition-colors">
            {abierto ? '▲ Cerrar' : '▼ Ver detalle'}
          </span>
        </div>
      </button>

      {/* Cuerpo expandible */}
      {abierto && (
        <div className="px-5 pb-5 space-y-4 border-t border-outline-variant/20 pt-4">
          {tieneCampos && (
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

          <EvaluacionesSeccion seccion={sec} asignaciones={asignaciones} />
        </div>
      )}
    </Card>
  );
};

// ── Opciones de decisión ───────────────────────────────────────────────────────
const DECISIONES = [
  {
    value: 'aprobado',
    label: 'Aprobar',
    description: 'El trámite cumple todos los requisitos.',
    active: 'bg-green-600 text-white ring-2 ring-green-600',
    idle: 'border border-outline-variant text-on-surface-variant hover:bg-green-50 dark:hover:bg-green-950/30 hover:border-green-400',
  },
  {
    value: 'observado',
    label: 'Observar',
    description: 'El solicitante debe corregir secciones indicadas.',
    active: 'bg-amber-500 text-white ring-2 ring-amber-500',
    idle: 'border border-outline-variant text-on-surface-variant hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:border-amber-400',
  },
  {
    value: 'rechazado',
    label: 'Rechazar',
    description: 'El trámite no puede continuar.',
    active: 'bg-red-600 text-white ring-2 ring-red-600',
    idle: 'border border-outline-variant text-on-surface-variant hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-400',
  },
];

// ── Page principal ─────────────────────────────────────────────────────────────
const TomarDecision = () => {
  const { tramite_id } = useParams();
  const navigate = useNavigate();

  const { data: tramite, isLoading } = useGetTramiteQuery(tramite_id);
  const [decisionFinal, { isLoading: submitting }] = useDecisionFinalMutation();

  const [decision, setDecision] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [seccionesObservadas, setSeccionesObservadas] = useState([]);
  const [plantillaUsadaId, setPlantillaUsadaId] = useState(null);

  const { data: plantillasData } = useGetPlantillasQuery(
    { tipo_decision: decision, estado: 'activa', limit: 50 },
    { skip: !decision },
  );
  const plantillas = plantillasData?.data ?? [];

  if (isLoading) {
    return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  }

  if (!tramite) {
    return <p className="text-body-md text-on-surface-variant italic">Trámite no encontrado.</p>;
  }

  const secciones = tramite.secciones_datos ?? [];
  const asignaciones = tramite.asignaciones_oficinas ?? [];

  const toggleSeccion = (seccion_id) =>
    setSeccionesObservadas((prev) =>
      prev.includes(seccion_id) ? prev.filter((id) => id !== seccion_id) : [...prev, seccion_id],
    );

  const handleSetDecision = (value) => {
    setDecision(value);
    setMensaje('');
    setPlantillaUsadaId(null);
    setSeccionesObservadas([]);
  };

  const applyPlantilla = (plantilla) => {
    const nombreSolicitante = `${tramite.solicitante?.nombre ?? ''} ${tramite.solicitante?.apellido ?? ''}`.trim();
    const oficinasNombres = asignaciones.map((a) => a.oficina?.nombre).filter(Boolean).join(' / ');
    const hoy = formatDate(new Date(), 'dd/MM/yyyy');

    const texto = (plantilla.contenido ?? '')
      .replace(/\[NOMBRE_SOLICITANTE\]/g, nombreSolicitante)
      .replace(/\[NUMERO_TRAMITE\]/g, tramite.numero ?? '')
      .replace(/\[TIPO_TRAMITE\]/g, tramite.tipo_tramite?.nombre ?? '')
      .replace(/\[EMPRESA\]/g, tramite.empresa?.razon_social ?? '')
      .replace(/\[NOMBRE_OFICINA\]/g, oficinasNombres)
      .replace(/\[FECHA\]/g, hoy);

    setMensaje(texto);
    setPlantillaUsadaId(plantilla.id);
  };

  const canSubmit =
    decision &&
    mensaje.trim().length >= 10 &&
    (decision !== 'observado' || seccionesObservadas.length > 0);

  const onSubmit = async () => {
    try {
      await decisionFinal({
        id: tramite_id,
        decision,
        mensaje_al_solicitante: mensaje,
        secciones_a_corregir: decision === 'observado' ? seccionesObservadas : undefined,
        plantilla_usada_id: plantillaUsadaId ?? undefined,
      }).unwrap();
      toast.success('Decisión registrada correctamente');
      navigate('/decision');
    } catch (err) {
      toast.error(err.data?.message ?? 'Error al registrar la decisión');
    }
  };

  // Resumen: cuántas secciones fueron observadas por alguna oficina
  const seccionesConObservacion = secciones.filter((sec) =>
    asignaciones.some((asig) =>
      (asig.evaluaciones_secciones ?? []).some(
        (e) => e.seccion_id === sec.seccion_id && !e.aprobada,
      ),
    ),
  );

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <Link to="/decision" className="text-label-sm text-on-surface-variant hover:underline">
          ← Bandeja Final
        </Link>
        <h1 className="text-display-sm text-primary font-semibold mt-1">
          Tomar Decisión · #{tramite.numero}
        </h1>
        <p className="text-body-md text-on-surface-variant">{tramite.tipo_tramite?.nombre}</p>
      </div>

      {/* Info general */}
      <Card elevated>
        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-body-sm">
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
          <div>
            <p className="text-label-sm text-on-surface-variant">Estado</p>
            <div className="mt-0.5"><StatusPill status={tramite.estado} /></div>
          </div>
        </div>
      </Card>

      <Tabs
        tabs={[
          {
            id: 'decision',
            label: 'Decisión',
            content: (
              <div className="space-y-6">
                {/* Resumen de oficinas */}
                {asignaciones.length > 0 && (
                  <Card elevated>
                    <div className="p-5 space-y-3">
                      <h3 className="text-title-md text-on-surface font-medium">Resumen de Revisiones</h3>
                      <div className="space-y-2">
                        {asignaciones.map((asig) => {
                          const tot = (asig.evaluaciones_secciones ?? []).length;
                          const aprobadas = (asig.evaluaciones_secciones ?? []).filter((e) => e.aprobada).length;
                          const observadas = tot - aprobadas;
                          return (
                            <div
                              key={asig.id}
                              className="flex items-center justify-between py-2 border-b border-outline-variant/20 last:border-0"
                            >
                              <div>
                                <p className="text-body-sm text-on-surface font-medium">
                                  {asig.oficina?.nombre ?? '—'}
                                </p>
                                {asig.jefe_asignado && (
                                  <p className="text-label-sm text-on-surface-variant">
                                    Aprobado por: {asig.jefe_asignado.nombre} {asig.jefe_asignado.apellido}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-label-sm">
                                <span className="text-tertiary font-medium">{aprobadas} aprobadas</span>
                                {observadas > 0 && (
                                  <span className="text-error font-medium">· {observadas} observadas</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Secciones con datos + evaluaciones por oficina */}
                {secciones.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-title-lg text-on-surface font-medium">
                        Formulario y Evaluaciones por Sección
                      </h2>
                      <p className="text-label-sm text-on-surface-variant">
                        {secciones.length} sección{secciones.length !== 1 ? 'es' : ''} · hacé clic para expandir
                      </p>
                    </div>
                    {secciones.map((sec) => (
                      <SeccionConEvaluaciones
                        key={sec.id}
                        sec={sec}
                        asignaciones={asignaciones}
                      />
                    ))}
                  </div>
                )}

                {/* Alerta de secciones observadas */}
                {seccionesConObservacion.length > 0 && (
                  <Card elevated>
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded">
                      <p className="text-label-md text-amber-800 dark:text-amber-300 font-semibold mb-1">
                        {seccionesConObservacion.length} sección(es) con observaciones de oficinas:
                      </p>
                      <ul className="list-disc list-inside text-body-sm text-on-surface-variant space-y-0.5">
                        {seccionesConObservacion.map((sec) => (
                          <li key={sec.id}>{sec.seccion?.titulo ?? sec.seccion_id}</li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                )}

                {/* Selector de decisión */}
                <Card elevated>
                  <div className="p-5 space-y-4">
                    <h3 className="text-title-md text-on-surface font-medium">Tu Decisión</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {DECISIONES.map((d) => (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => handleSetDecision(d.value)}
                          className={cn(
                            'rounded p-3 text-center transition-all duration-150',
                            decision === d.value ? d.active : d.idle,
                          )}
                        >
                          <p className="text-label-lg font-semibold">{d.label}</p>
                          <p className="text-label-sm mt-0.5 opacity-80">{d.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Secciones a observar */}
                {decision === 'observado' && secciones.length > 0 && (
                  <Card elevated>
                    <div className="p-5 space-y-3">
                      <h3 className="text-title-md text-on-surface font-medium">
                        Secciones a corregir <span className="text-error">*</span>
                      </h3>
                      <div className="space-y-2">
                        {secciones.map((sec) => (
                          <label
                            key={sec.id}
                            className="flex items-center gap-3 cursor-pointer py-2 border-b border-outline-variant/20 last:border-0"
                          >
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded accent-primary"
                              checked={seccionesObservadas.includes(sec.seccion_id)}
                              onChange={() => toggleSeccion(sec.seccion_id)}
                            />
                            <span className="text-body-md text-on-surface">
                              {sec.seccion?.titulo ?? sec.seccion_id}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Mensaje al solicitante */}
                {decision && (
                  <Card elevated>
                    <div className="p-5 space-y-4">
                      <p className="text-label-md text-on-surface-variant font-medium">
                        Mensaje al solicitante <span className="text-error">*</span>
                      </p>
                      {plantillas.length > 0 && (
                        <div>
                          <p className="text-label-sm text-on-surface-variant mb-2">
                            Usar plantilla como base
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {plantillas.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => applyPlantilla(p)}
                                className={cn(
                                  'px-3 py-1.5 rounded text-label-sm transition-all duration-150 border',
                                  plantillaUsadaId === p.id
                                    ? 'bg-primary text-on-primary border-primary'
                                    : 'border-outline-variant text-on-surface-variant hover:bg-surface-container',
                                )}
                              >
                                {p.nombre}
                              </button>
                            ))}
                          </div>
                          {plantillaUsadaId && (
                            <p className="text-label-sm text-on-surface-variant/60 mt-1">
                              Podés editar el texto libremente antes de registrar.
                            </p>
                          )}
                        </div>
                      )}
                      <textarea
                        className="w-full rounded p-3 text-body-sm bg-surface border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                        rows={5}
                        placeholder={
                          decision === 'aprobado'
                            ? 'Ej: Su trámite fue aprobado. Puede retirar la habilitación en...'
                            : decision === 'observado'
                            ? 'Ej: Se solicita corregir los siguientes puntos...'
                            : 'Ej: El trámite fue rechazado debido a...'
                        }
                        value={mensaje}
                        onChange={(e) => { setMensaje(e.target.value); setPlantillaUsadaId(null); }}
                      />
                      {mensaje.trim().length > 0 && mensaje.trim().length < 10 && (
                        <p className="text-label-sm text-error">Mínimo 10 caracteres</p>
                      )}
                    </div>
                  </Card>
                )}

                {/* Submit */}
                <div className="flex justify-end gap-3">
                  <Link to="/decision">
                    <Button variant="secondary" type="button">Cancelar</Button>
                  </Link>
                  <Button onClick={onSubmit} isLoading={submitting} disabled={!canSubmit}>
                    Registrar Decisión
                  </Button>
                </div>
              </div>
            ),
          },
          {
            id: 'historial',
            label: `Historial (${(tramite.historial ?? []).length})`,
            content: <HistorialTramite historial={tramite.historial ?? []} defaultOpen />,
          },
        ]}
      />
    </div>
  );
};

export default TomarDecision;
