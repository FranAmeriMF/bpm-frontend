import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useGetTramitesQuery } from '@api/tramitesApi';
import { Button, Spinner, StatusPill } from '@components/atoms';
import { EmptyState, Pagination, SearchBar } from '@components/molecules';
import { formatDate } from '@utils/helpers';

const LIMIT = 20;

const ESTADOS = [
  { value: '',                    label: 'Todos los estados'     },
  { value: 'borrador',            label: 'Borrador'              },
  { value: 'en_revision_interna', label: 'Revisión interna'      },
  { value: 'pendiente_asignacion',label: 'Pendiente asignación'  },
  { value: 'asignado',            label: 'Asignado'              },
  { value: 'en_revision',         label: 'En revisión'           },
  { value: 'en_revision_final',   label: 'Revisión final'        },
  { value: 'aprobado',            label: 'Aprobado'              },
  { value: 'rechazado',           label: 'Rechazado'             },
  { value: 'observado',           label: 'Observado'             },
  { value: 'corrigiendo',         label: 'Corrigiendo'           },
];

const TramitesEmpresa = () => {
  const { user } = useAuth();
  const empresaId = user?.empresa_id;

  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [page, setPage]     = useState(1);

  const { data, isLoading } = useGetTramitesQuery({
    empresa_id: empresaId,
    ...(estado  && { estado }),
    ...(search  && { buscar: search }),
    page,
    limit: LIMIT,
  }, { skip: !empresaId });

  const tramites   = data?.data      ?? [];
  const total      = data?.total     ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display-sm text-primary font-semibold">Trámites de la Empresa</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Todos los trámites presentados por usuarios de tu empresa
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          onClear={() => { setSearch(''); setPage(1); }}
          placeholder="Buscar por número o solicitante…"
          className="flex-1"
        />
        <select
          value={estado}
          onChange={(e) => { setEstado(e.target.value); setPage(1); }}
          className="h-10 px-3 rounded border border-outline-variant bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 w-52"
        >
          {ESTADOS.map((e) => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : tramites.length === 0 ? (
        <EmptyState
          title="Sin trámites"
          description="No se encontraron trámites con los filtros actuales."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded shadow-ambient">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant text-left">
                  <th className="px-4 py-3 font-medium">Número</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Solicitante</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {tramites.map((t) => (
                  <tr key={t.id} className="bg-surface hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3 font-mono text-label-md text-primary">{t.numero}</td>
                    <td className="px-4 py-3 text-on-surface">{t.tipo_tramite?.nombre ?? '—'}</td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {t.solicitante?.nombre} {t.solicitante?.apellido}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={t.estado} />
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {t.fecha_creacion ? formatDate(t.fecha_creacion, 'dd/MM/yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/tramites/${t.id}`}>
                        <Button size="sm" variant="secondary">Ver</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={LIMIT}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};

export default TramitesEmpresa;
