import { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import {
  useGetReportesDashboardQuery,
  useGetTramitesPorEstadoQuery,
  useGetDesempenoOficinasQuery,
  useGetDesempenoDecisorQuery,
} from '@api/reportesApi';
import { useAuth } from '@hooks/useAuth';
import { Card, Skeleton, Spinner } from '@components/atoms';
import { TRAMITE_ESTADO_LABELS } from '@utils/helpers';

// ── Colores de estado ──────────────────────────────────────────────────────────
const ESTADO_COLORS = {
  borrador:             '#9CA3AF',
  en_revision_interna:  '#60A5FA',
  pendiente_asignacion: '#A78BFA',
  asignado:             '#2563EB',
  en_revision:          '#3B82F6',
  en_revision_final:    '#9333EA',
  aprobado:             '#16A34A',
  rechazado:            '#DC2626',
  observado:            '#F59E0B',
  corrigiendo:          '#8B5CF6',
};

// ── KPI card ───────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, isLoading }) => (
  <Card elevated>
    <div className="p-5 space-y-1">
      <p className="text-label-sm text-on-surface-variant font-medium uppercase tracking-wide">{label}</p>
      {isLoading
        ? <Skeleton className="h-9 w-20 mt-1" />
        : <p className="text-display-sm text-on-surface font-semibold">{value ?? '—'}</p>}
      {sub && <p className="text-label-sm text-on-surface-variant">{sub}</p>}
    </div>
  </Card>
);

// ── Gráfico de barras: trámites por estado ─────────────────────────────────────
const BarEstados = ({ data, isLoading }) => {
  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!data?.length) return (
    <p className="text-body-sm text-on-surface-variant italic py-8 text-center">Sin datos para el período.</p>
  );

  const chartData = data.map((item) => ({
    name: TRAMITE_ESTADO_LABELS[item.estado] ?? item.estado,
    cantidad: item._count?.id ?? item.cantidad ?? 0,
    color: ESTADO_COLORS[item.estado] ?? '#9CA3AF',
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }}
          angle={-35}
          textAnchor="end"
          interval={0}
        />
        <YAxis tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }} allowDecimals={false} />
        <Tooltip
          formatter={(v) => [v, 'Trámites']}
          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.15)' }}
        />
        <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// ── Sección: resumen general (admin + moderador) ───────────────────────────────
const SeccionResumen = () => {
  const { data, isLoading } = useGetReportesDashboardQuery();

  const kpis = [
    { label: 'Total trámites',     value: data?.total_tramites,          sub: 'histórico' },
    { label: 'Nuevos esta semana', value: data?.nuevos_esta_semana,       sub: 'últimos 7 días' },
    { label: 'Empresas activas',   value: data?.total_empresas_activas,   sub: undefined },
    { label: 'Usuarios activos',   value: data?.total_usuarios_activos,   sub: undefined },
  ];

  // Pie chart data
  const porEstado = (data?.por_estado ?? []).filter((e) => e.cantidad > 0);
  const pieData = porEstado.map((e) => ({
    name: TRAMITE_ESTADO_LABELS[e.estado] ?? e.estado,
    value: e.cantidad,
    color: ESTADO_COLORS[e.estado] ?? '#9CA3AF',
  }));

  return (
    <section className="space-y-4">
      <h2 className="text-title-lg text-on-surface font-medium">Resumen General</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} isLoading={isLoading} />
        ))}
      </div>

      {pieData.length > 0 && (
        <Card elevated>
          <div className="p-6">
            <h3 className="text-title-md text-on-surface font-medium mb-4">Distribución actual por estado</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={85} dataKey="value" strokeWidth={0}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, n) => [v, n]}
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.15)' }}
                />
                <Legend iconType="circle" iconSize={8} formatter={(v) => (
                  <span className="text-label-sm text-on-surface-variant">{v}</span>
                )} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </section>
  );
};

// ── Sección: trámites por estado con filtro de fechas ─────────────────────────
const SeccionTramitesPorEstado = () => {
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const params = {};
  if (fechaDesde) params.fecha_desde = fechaDesde;
  if (fechaHasta) params.fecha_hasta = fechaHasta;

  const { data, isLoading, isFetching } = useGetTramitesPorEstadoQuery(params);

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
        <h2 className="text-title-lg text-on-surface font-medium">Trámites por Estado</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-label-sm text-on-surface-variant whitespace-nowrap">Desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="px-3 py-2 rounded-sm bg-surface-container-lowest text-on-surface text-body-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-label-sm text-on-surface-variant whitespace-nowrap">Hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="px-3 py-2 rounded-sm bg-surface-container-lowest text-on-surface text-body-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {(fechaDesde || fechaHasta) && (
            <button
              onClick={() => { setFechaDesde(''); setFechaHasta(''); }}
              className="text-label-sm text-primary hover:underline"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      <Card elevated>
        <div className="p-6">
          {isFetching && !isLoading && (
            <p className="text-label-sm text-on-surface-variant mb-3">Actualizando…</p>
          )}
          <BarEstados data={data} isLoading={isLoading} />
        </div>
      </Card>
    </section>
  );
};

// ── Sección: desempeño de oficinas (solo admin) ────────────────────────────────
const SeccionOficinas = () => {
  const { data, isLoading } = useGetDesempenoOficinasQuery();
  const oficinas = data ?? [];

  return (
    <section className="space-y-4">
      <h2 className="text-title-lg text-on-surface font-medium">Desempeño de Oficinas</h2>
      <Card elevated>
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : oficinas.length === 0 ? (
          <p className="p-6 text-body-sm text-on-surface-variant italic">Sin datos de oficinas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant text-left">
                  <th className="px-4 py-3 font-medium">Oficina</th>
                  <th className="px-4 py-3 font-medium text-center">Total asignaciones</th>
                  <th className="px-4 py-3 font-medium text-center">Completadas</th>
                  <th className="px-4 py-3 font-medium text-center">Pendientes</th>
                  <th className="px-4 py-3 font-medium text-center">Tiempo promedio</th>
                  <th className="px-4 py-3 font-medium text-center">Tasa completado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {oficinas.map((o) => {
                  const tasa = o.total_asignaciones > 0
                    ? Math.round((o.completadas / o.total_asignaciones) * 100)
                    : 0;
                  return (
                    <tr key={o.oficina_id} className="bg-surface hover:bg-surface-container-low transition-colors">
                      <td className="px-4 py-3 text-on-surface font-medium">{o.nombre}</td>
                      <td className="px-4 py-3 text-center text-on-surface-variant">{o.total_asignaciones}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-success font-medium">{o.completadas}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={o.pendientes > 0 ? 'text-caution font-medium' : 'text-on-surface-variant'}>
                          {o.pendientes}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-on-surface-variant">
                        {o.tiempo_promedio_horas != null ? `${o.tiempo_promedio_horas} h` : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                            <div
                              className="h-full bg-success rounded-full"
                              style={{ width: `${tasa}%` }}
                            />
                          </div>
                          <span className="text-label-sm text-on-surface-variant tabular-nums">{tasa}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </section>
  );
};

// ── Sección: mi desempeño como decisor (jefe_oficina) ─────────────────────────
const SeccionDecisor = () => {
  const { data, isLoading } = useGetDesempenoDecisorQuery();

  const items = [
    { label: 'Total decisiones', value: data?.total,      color: 'text-primary' },
    { label: 'Aprobados',        value: data?.aprobados,  color: 'text-success' },
    { label: 'Observados',       value: data?.observados, color: 'text-caution' },
    { label: 'Rechazados',       value: data?.rechazados, color: 'text-error' },
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-title-lg text-on-surface font-medium">Mi Desempeño como Decisor</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <Card key={item.label} elevated>
            <div className="p-5 space-y-1">
              <p className="text-label-sm text-on-surface-variant font-medium uppercase tracking-wide">
                {item.label}
              </p>
              {isLoading
                ? <Skeleton className="h-9 w-16 mt-1" />
                : <p className={`text-display-sm font-semibold ${item.color}`}>{data ? item.value : '—'}</p>}
            </div>
          </Card>
        ))}
      </div>

      {!isLoading && data?.total > 0 && (
        <Card elevated>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-title-md text-on-surface font-medium">Tasa de aprobación</h3>
              <span className="text-display-sm text-success font-semibold">
                {data.tasa_aprobacion}
              </span>
            </div>
            <div className="h-3 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full transition-all duration-700"
                style={{ width: data.tasa_aprobacion }}
              />
            </div>
            <div className="flex gap-6 mt-4 flex-wrap">
              {[
                { label: 'Aprobados',  pct: data.total ? Math.round((data.aprobados  / data.total) * 100) : 0, color: 'bg-success' },
                { label: 'Observados', pct: data.total ? Math.round((data.observados / data.total) * 100) : 0, color: 'bg-caution' },
                { label: 'Rechazados', pct: data.total ? Math.round((data.rechazados / data.total) * 100) : 0, color: 'bg-error'   },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${b.color} shrink-0`} />
                  <span className="text-label-sm text-on-surface-variant">
                    {b.label} <span className="font-medium text-on-surface">{b.pct}%</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {!isLoading && data?.total === 0 && (
        <Card elevated>
          <p className="p-6 text-body-sm text-on-surface-variant italic text-center">
            Todavía no tomaste ninguna decisión final.
          </p>
        </Card>
      )}
    </section>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────────
const Reportes = () => {
  const { user } = useAuth();
  const rol = user?.rol;

  const isAdmin     = rol === 'admin';
  const isModerador = rol === 'moderador';
  const isDecisor   = rol === 'jefe_oficina';

  const showResumen  = isAdmin || isModerador;
  const showOficinas = isAdmin;
  const showDecisor  = isDecisor;

  if (!showResumen && !showOficinas && !showDecisor) {
    return (
      <div className="space-y-4">
        <h1 className="text-display-sm text-primary font-semibold">Reportes</h1>
        <p className="text-body-md text-on-surface-variant">No tenés acceso a reportes disponibles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w">
      <div>
        <h1 className="text-display-sm text-primary font-semibold">Reportes</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Análisis y métricas del sistema de trámites
        </p>
      </div>

      {showResumen   && <SeccionResumen />}
      {showResumen   && <SeccionTramitesPorEstado />}
      {showOficinas  && <SeccionOficinas />}
      {showDecisor   && <SeccionDecisor />}
    </div>
  );
};

export default Reportes;
