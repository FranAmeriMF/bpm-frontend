import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { useGetEstadisticasQuery, useGetTramitesQuery } from '@api/tramitesApi';
import { useAuth } from '@hooks/useAuth';
import { Card, Skeleton, StatusPill } from '@components/atoms';
import { TRAMITE_ESTADO_LABELS, formatDate } from '@utils/helpers';

// ── Color map for chart (hex values matching design tokens) ───────────────────
const ESTADO_COLORS = {
  borrador:               '#9CA3AF',
  en_revision_interna:    '#60A5FA',
  pendiente_asignacion:   '#A78BFA',
  asignado:               '#34D399',
  en_revision:            '#F59E0B',
  en_revision_final:      '#F97316',
  aprobado:               '#10B981',
  rechazado:              '#EF4444',
  observado:              '#FBBF24',
  corrigiendo:            '#8B5CF6',
};

// Which estados each role cares about for stat cards
const ROLE_STATS = {
  solicitante:  ['borrador', 'en_revision_interna', 'observado', 'aprobado', 'rechazado'],
  director:     ['en_revision_interna'],
  moderador:    ['pendiente_asignacion', 'en_revision', 'aprobado'],
  jefe_oficina: ['asignado', 'en_revision', 'en_revision_final'],
  interno:      ['asignado', 'en_revision'],
  admin:        ['pendiente_asignacion', 'en_revision', 'en_revision_final', 'aprobado', 'rechazado', 'observado'],
};

// Quick-action links per role
const ROLE_ACTIONS = {
  solicitante:  [{ label: '+ Nuevo Trámite', to: '/tramites/nuevo' }, { label: 'Mis Trámites', to: '/tramites' }],
  director:     [{ label: 'Bandeja de Revisión', to: '/director' }],
  moderador:    [{ label: 'Asignar Trámites', to: '/asignacion' }, { label: 'Ver Trámites', to: '/tramites' }],
  jefe_oficina: [{ label: 'Mis Revisiones', to: '/revisiones' }, { label: 'Bandeja Final', to: '/decision' }],
  interno:      [{ label: 'Mis Revisiones', to: '/revisiones' }],
  admin:        [{ label: 'Trámites', to: '/tramites' }, { label: 'Asignación', to: '/asignacion' }],
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ estado, count, isLoading }) => (
  <Card elevated>
    <div className="p-5">
      <p className="text-label-sm text-on-surface-variant font-medium uppercase tracking-wide">
        {TRAMITE_ESTADO_LABELS[estado] ?? estado}
      </p>
      {isLoading ? (
        <Skeleton className="h-8 w-16 mt-2" />
      ) : (
        <p className="text-display-sm text-on-surface font-semibold mt-1">{count}</p>
      )}
    </div>
  </Card>
);

// ── Recharts PieChart ─────────────────────────────────────────────────────────
const EstadoChart = ({ porEstado }) => {
  const data = Object.entries(porEstado)
    .filter(([, v]) => v > 0)
    .map(([estado, value]) => ({
      name: TRAMITE_ESTADO_LABELS[estado] ?? estado,
      value,
      color: ESTADO_COLORS[estado] ?? '#9CA3AF',
    }));

  if (data.length === 0) return null;

  return (
    <Card elevated>
      <div className="p-6">
        <h3 className="text-title-md text-on-surface font-medium mb-4">Distribución por Estado</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={90}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [value, name]}
              contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.12)' }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-label-sm text-on-surface-variant">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

// ── Recent tramites ───────────────────────────────────────────────────────────
const RecentTramites = ({ tramites, isLoading }) => (
  <Card elevated>
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-title-md text-on-surface font-medium">Últimos Trámites</h3>
        <Link to="/tramites" className="text-label-sm text-primary hover:underline">
          Ver todos →
        </Link>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : tramites.length === 0 ? (
        <p className="text-body-sm text-on-surface-variant italic">Sin trámites recientes.</p>
      ) : (
        <div className="divide-y divide-outline-variant/20">
          {tramites.map((t) => (
            <Link
              key={t.id}
              to={`/tramites/${t.id}`}
              className="flex items-center justify-between py-3 hover:text-primary transition-colors"
            >
              <div className="min-w-0">
                <p className="text-body-sm text-on-surface font-mono">{t.numero}</p>
                <p className="text-label-sm text-on-surface-variant truncate">{t.tipo_tramite?.nombre}</p>
              </div>
              <div className="flex items-center gap-3 ml-4 shrink-0">
                <StatusPill status={t.estado} />
                <span className="text-label-sm text-on-surface-variant hidden sm:block">
                  {t.fecha_creacion ? formatDate(t.fecha_creacion, 'dd/MM/yyyy') : ''}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  </Card>
);

// ── Main Dashboard ─────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const rol = user?.rol ?? 'solicitante';

  const { data: stats, isLoading: statsLoading } = useGetEstadisticasQuery();
  const { data: recent, isLoading: recentLoading } = useGetTramitesQuery({ page: 1, limit: 5 });

  const porEstado = stats?.por_estado ?? {};
  const focusEstados = ROLE_STATS[rol] ?? ROLE_STATS.solicitante;
  const actions = ROLE_ACTIONS[rol] ?? [];
  const showChart = ['solicitante', 'admin', 'moderador'].includes(rol);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-display-sm text-primary font-semibold">Dashboard</h1>
        <p className="text-body-lg text-on-surface-variant mt-1">
          Bienvenido, {user?.nombre} {user?.apellido}
        </p>
      </div>

      {/* Quick actions */}
      {actions.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {actions.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className="inline-flex items-center px-4 py-2 rounded bg-primary text-on-primary text-label-lg font-medium shadow-ambient hover:opacity-90 transition-opacity"
            >
              {label}
            </Link>
          ))}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {focusEstados.map((estado) => (
          <StatCard
            key={estado}
            estado={estado}
            count={porEstado[estado] ?? 0}
            isLoading={statsLoading}
          />
        ))}
      </div>

      {/* Chart + Recent (side by side on wider screens) */}
      <div className={showChart ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}>
        {showChart && Object.keys(porEstado).length > 0 && (
          <EstadoChart porEstado={porEstado} />
        )}
        <RecentTramites tramites={recent?.data ?? []} isLoading={recentLoading} />
      </div>
    </div>
  );
};

export default Dashboard;
