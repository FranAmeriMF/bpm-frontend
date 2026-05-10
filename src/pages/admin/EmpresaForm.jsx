import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import {
  useGetEmpresaQuery,
  useCreateEmpresaMutation,
  useUpdateEmpresaMutation,
  useGetEmpresaUsuariosQuery,
  useGetEmpresaStatsQuery,
} from '@api/empresasApi';
import { useGetUsuariosQuery } from '@api/usuariosApi';
import { Button, Card, Input, Spinner } from '@components/atoms';
import { cn, ROL_LABELS, formatDate } from '@utils/helpers';

// ── Schemas ───────────────────────────────────────────────────────────────────

const schemaCrear = yup.object({
  razon_social:    yup.string().required('Requerido'),
  nombre_fantasia: yup.string(),
  cuit:            yup.string().required('Requerido'),
  direccion:       yup.string().required('Requerido'),
  telefono:        yup.string(),
  email:           yup.string().email('Email inválido').required('Requerido'),
  director: yup.object({
    nombre:   yup.string().required('Requerido'),
    apellido: yup.string().required('Requerido'),
    email:    yup.string().email('Email inválido').required('Requerido'),
    dni:      yup.string().required('Requerido'),
    telefono: yup.string(),
    cargo:    yup.string(),
  }).required(),
});

const schemaEditar = yup.object({
  razon_social:    yup.string().required('Requerido'),
  nombre_fantasia: yup.string(),
  cuit:            yup.string().required('Requerido'),
  direccion:       yup.string().required('Requerido'),
  telefono:        yup.string(),
  email:           yup.string().email('Email inválido').required('Requerido'),
  director_id:     yup.string(),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const ESTADO_LABELS = { activa: 'Activa', inactiva: 'Inactiva', suspendida: 'Suspendida' };
const ESTADO_STYLES = {
  activa:     'bg-tertiary-fixed text-on-tertiary-fixed',
  inactiva:   'bg-error-container text-on-error-container',
  suspendida: 'bg-tertiary-container text-on-tertiary-container',
};
const USUARIO_ESTADO_STYLES = {
  activo:     'bg-tertiary-fixed text-on-tertiary-fixed',
  suspendido: 'bg-tertiary-container text-on-tertiary-container',
  inactivo:   'bg-error-container text-on-error-container',
};

const ESTADO_TRAMITE_LABELS = {
  borrador:             'Borrador',
  en_revision_interna:  'Rev. interna',
  pendiente_asignacion: 'Pend. asignación',
  asignado:             'Asignado',
  en_revision:          'En revisión',
  corrigiendo:          'Corrigiendo',
  en_revision_final:    'Revisión final',
  aprobado:             'Aprobado',
  rechazado:            'Rechazado',
  observado:            'Observado',
};

const EN_PROCESO = ['en_revision_interna', 'pendiente_asignacion', 'asignado', 'en_revision', 'corrigiendo', 'en_revision_final'];

// ── Sub-components ────────────────────────────────────────────────────────────

const MetricCard = ({ label, value, sub, color = 'bg-primary-fixed text-on-primary-container' }) => (
  <Card elevated>
    <div className="p-5">
      <p className="text-label-md text-on-surface-variant">{label}</p>
      <p className={cn('text-display-sm font-bold mt-1 inline-flex px-2 rounded', color)}>{value}</p>
      {sub && <p className="text-label-sm text-on-surface-variant mt-1">{sub}</p>}
    </div>
  </Card>
);

const TabBar = ({ tabs, active, onChange }) => (
  <div className="flex border-b border-outline-variant/30">
    {tabs.map(t => (
      <button
        key={t.id}
        onClick={() => onChange(t.id)}
        className={cn(
          'px-5 py-3 text-body-md font-medium border-b-2 transition-colors',
          active === t.id
            ? 'border-primary text-primary'
            : 'border-transparent text-on-surface-variant hover:text-on-surface'
        )}
      >
        {t.label}
      </button>
    ))}
  </div>
);

// ── Tabs content ──────────────────────────────────────────────────────────────

const TabDatos = ({ empresa, isEdit, register, errors, handleSubmit, onSubmit, saving, directores }) => (
  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-6">
    <Card elevated>
      <div className="p-6 space-y-5">
        <h2 className="text-title-md text-on-surface font-medium">Datos de la Empresa</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input label="Razón Social" required error={errors.razon_social?.message} {...register('razon_social')} />
          <Input label="Nombre de Fantasía" error={errors.nombre_fantasia?.message} {...register('nombre_fantasia')} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input label="CUIT" required placeholder="30-12345678-9" error={errors.cuit?.message} {...register('cuit')} />
          <Input label="Dirección" required error={errors.direccion?.message} {...register('direccion')} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input label="Email corporativo" type="email" required error={errors.email?.message} {...register('email')} />
          <Input label="Teléfono" error={errors.telefono?.message} {...register('telefono')} />
        </div>
      </div>
    </Card>

    {!isEdit && (
      <Card elevated>
        <div className="p-6 space-y-5">
          <div>
            <h2 className="text-title-md text-on-surface font-medium">Director de la Empresa</h2>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              Se creará un usuario con rol director y recibirá su contraseña por email.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Nombre" required error={errors.director?.nombre?.message} {...register('director.nombre')} />
            <Input label="Apellido" required error={errors.director?.apellido?.message} {...register('director.apellido')} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Email" type="email" required error={errors.director?.email?.message} {...register('director.email')} />
            <Input label="DNI" required error={errors.director?.dni?.message} {...register('director.dni')} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Teléfono" error={errors.director?.telefono?.message} {...register('director.telefono')} />
            <Input label="Cargo" placeholder="Director General" error={errors.director?.cargo?.message} {...register('director.cargo')} />
          </div>
        </div>
      </Card>
    )}

    {isEdit && (
      <Card elevated>
        <div className="p-6 space-y-3">
          <h2 className="text-title-md text-on-surface font-medium">Director</h2>
          {empresa?.director && (
            <p className="text-body-sm text-on-surface-variant">
              Actual: <span className="font-medium text-on-surface">
                {empresa.director.nombre} {empresa.director.apellido}
              </span> — {empresa.director.email}
            </p>
          )}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1.5 font-medium">
              Cambiar director
            </label>
            <select
              {...register('director_id')}
              className="w-full h-10 px-3 rounded border border-outline-variant bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">Sin cambios</option>
              {directores.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre} {u.apellido} — {u.email}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>
    )}

    <div className="flex justify-end gap-3">
      <Link to="/empresas"><Button variant="secondary" type="button">Cancelar</Button></Link>
      <Button type="submit" isLoading={saving}>
        {isEdit ? 'Guardar Cambios' : 'Crear Empresa'}
      </Button>
    </div>
  </form>
);

const TabUsuarios = ({ empresaId, navigate }) => {
  const { data: usuarios = [], isLoading } = useGetEmpresaUsuariosQuery(empresaId);

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <div className="pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-body-md text-on-surface-variant">
          {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} vinculados a esta empresa
        </p>
        <Button size="sm" onClick={() => navigate(`/usuarios-externos/nuevo?empresa_id=${empresaId}&rol=solicitante`)}>
          + Agregar usuario
        </Button>
      </div>

      {usuarios.length === 0 ? (
        <div className="py-12 text-center text-body-md text-on-surface-variant italic bg-surface-container-low rounded">
          No hay usuarios vinculados a esta empresa.
        </div>
      ) : (
        <div className="overflow-x-auto rounded shadow-ambient">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant text-left">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {usuarios.map((u) => (
                <tr key={u.id} className="bg-surface hover:bg-surface-container-low transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-on-surface">{u.nombre} {u.apellido}</p>
                    {u.cargo && <p className="text-label-sm text-on-surface-variant">{u.cargo}</p>}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2.5 py-1 rounded bg-secondary-container text-on-secondary-container text-label-sm font-medium">
                      {ROL_LABELS[u.rol] ?? u.rol}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex px-2.5 py-1 rounded-full text-label-sm font-medium', USUARIO_ESTADO_STYLES[u.estado] ?? USUARIO_ESTADO_STYLES.inactivo)}>
                      {{ activo: 'Activo', suspendido: 'Suspendido', inactivo: 'Inactivo' }[u.estado] ?? u.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="secondary" onClick={() => navigate(`/usuarios-externos/${u.id}/editar`)}>
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const TabActividad = ({ empresaId }) => {
  const { data: stats, isLoading } = useGetEmpresaStatsQuery(empresaId);

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (!stats) return null;

  const { total_tramites, total_usuarios, por_estado = {} } = stats;

  const enProceso   = EN_PROCESO.reduce((sum, k) => sum + (por_estado[k] ?? 0), 0);
  const aprobados   = por_estado['aprobado']  ?? 0;
  const rechazados  = por_estado['rechazado'] ?? 0;
  const observados  = por_estado['observado'] ?? 0;

  const estadosOrdenados = Object.entries(ESTADO_TRAMITE_LABELS)
    .map(([key, label]) => ({ key, label, count: por_estado[key] ?? 0 }))
    .filter(e => e.count > 0);

  return (
    <div className="pt-6 space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total trámites"
          value={total_tramites}
          color="bg-primary-fixed text-on-primary-container"
        />
        <MetricCard
          label="En proceso"
          value={enProceso}
          color="bg-secondary-container text-on-secondary-container"
        />
        <MetricCard
          label="Aprobados"
          value={aprobados}
          color="bg-tertiary-fixed text-on-tertiary-fixed"
        />
        <MetricCard
          label="Rechazados / Observados"
          value={rechazados + observados}
          color="bg-error-container text-on-error-container"
        />
      </div>

      {/* Breakdown by estado */}
      {estadosOrdenados.length > 0 ? (
        <Card elevated>
          <div className="p-5">
            <h3 className="text-title-sm text-on-surface font-medium mb-4">Desglose por estado</h3>
            <div className="space-y-2">
              {estadosOrdenados.map(({ key, label, count }) => {
                const pct = total_tramites > 0 ? Math.round((count / total_tramites) * 100) : 0;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="w-40 text-body-sm text-on-surface-variant flex-shrink-0">{label}</span>
                    <div className="flex-1 bg-surface-container rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-label-sm text-on-surface font-medium">{count}</span>
                    <span className="w-10 text-right text-label-sm text-on-surface-variant">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      ) : (
        <div className="py-12 text-center text-body-md text-on-surface-variant italic bg-surface-container-low rounded">
          Esta empresa no tiene trámites registrados aún.
        </div>
      )}

      <p className="text-label-sm text-on-surface-variant">
        Total de usuarios vinculados: <strong>{total_usuarios}</strong>
      </p>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const TABS = [
  { id: 'datos',    label: 'Datos' },
  { id: 'usuarios', label: 'Usuarios' },
  { id: 'actividad', label: 'Actividad' },
];

const EmpresaForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('datos');

  const { data: empresa, isLoading: loadingEmpresa } = useGetEmpresaQuery(id, { skip: !isEdit });
  const { data: directoresData } = useGetUsuariosQuery(
    { rol: 'director', limit: 100 },
    { skip: !isEdit },
  );
  const directores = directoresData?.data ?? [];

  const [createEmpresa, { isLoading: creating }] = useCreateEmpresaMutation();
  const [updateEmpresa, { isLoading: updating }]  = useUpdateEmpresaMutation();
  const saving = creating || updating;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(isEdit ? schemaEditar : schemaCrear),
    defaultValues: isEdit ? {} : {
      director: { nombre: '', apellido: '', email: '', dni: '', telefono: '', cargo: '' },
    },
  });

  useEffect(() => {
    if (empresa) {
      reset({
        razon_social:    empresa.razon_social    ?? '',
        nombre_fantasia: empresa.nombre_fantasia ?? '',
        cuit:            empresa.cuit            ?? '',
        direccion:       empresa.direccion       ?? '',
        telefono:        empresa.telefono        ?? '',
        email:           empresa.email           ?? '',
        director_id:     empresa.director_id     ?? '',
      });
    }
  }, [empresa, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateEmpresa({
          id,
          ...data,
          nombre_fantasia: data.nombre_fantasia || undefined,
          telefono:        data.telefono        || undefined,
          director_id:     data.director_id     || undefined,
        }).unwrap();
        toast.success('Empresa actualizada');
      } else {
        const payload = {
          razon_social:    data.razon_social,
          nombre_fantasia: data.nombre_fantasia || undefined,
          cuit:            data.cuit,
          direccion:       data.direccion,
          telefono:        data.telefono        || undefined,
          email:           data.email,
          director: {
            nombre:   data.director.nombre,
            apellido: data.director.apellido,
            email:    data.director.email,
            dni:      data.director.dni,
            telefono: data.director.telefono || undefined,
            cargo:    data.director.cargo    || undefined,
          },
        };
        const created = await createEmpresa(payload).unwrap();
        toast.success('Empresa y director creados. Se envió email con contraseña temporal.');
        navigate(`/empresas/${created.empresa.id}/editar`, { replace: true });
      }
    } catch (err) {
      toast.error(err.data?.message ?? 'Error al guardar');
    }
  };

  if (isEdit && loadingEmpresa) {
    return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header */}
      <div>
        <Link to="/empresas" className="text-label-sm text-on-surface-variant hover:underline">
          ← Empresas
        </Link>
        <div className="flex items-start justify-between mt-1 gap-4 flex-wrap">
          <div>
            <h1 className="text-display-sm text-primary font-semibold">
              {isEdit ? (empresa?.razon_social ?? 'Empresa') : 'Nueva Empresa'}
            </h1>
            {isEdit && empresa && (
              <p className="text-body-sm text-on-surface-variant mt-0.5">
                CUIT {empresa.cuit}
                {empresa.email && <> · {empresa.email}</>}
                {empresa.telefono && <> · {empresa.telefono}</>}
              </p>
            )}
          </div>
          {isEdit && empresa?.estado && (
            <span className={cn('inline-flex px-3 py-1 rounded-full text-label-md font-medium', ESTADO_STYLES[empresa.estado] ?? ESTADO_STYLES.inactiva)}>
              {ESTADO_LABELS[empresa.estado] ?? empresa.estado}
            </span>
          )}
        </div>
      </div>

      {/* Tabs (edit only) */}
      {isEdit ? (
        <>
          <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

          {activeTab === 'datos' && (
            <TabDatos
              empresa={empresa}
              isEdit={isEdit}
              register={register}
              errors={errors}
              handleSubmit={handleSubmit}
              onSubmit={onSubmit}
              saving={saving}
              directores={directores}
            />
          )}
          {activeTab === 'usuarios' && (
            <TabUsuarios empresaId={id} navigate={navigate} />
          )}
          {activeTab === 'actividad' && (
            <TabActividad empresaId={id} />
          )}
        </>
      ) : (
        <TabDatos
          empresa={null}
          isEdit={false}
          register={register}
          errors={errors}
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          saving={saving}
          directores={[]}
        />
      )}
    </div>
  );
};

export default EmpresaForm;
