import { Fragment, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'react-toastify';
import {
  ChevronUpIcon, ChevronDownIcon, PencilIcon, PlusIcon,
} from '@heroicons/react/24/outline';
import {
  useGetTipoTramiteQuery,
  useUpdateTipoTramiteMutation,
  useActivarTipoTramiteMutation,
  useNuevaVersionTipoTramiteMutation,
  useSetModoAsignacionMutation,
  useCreateSeccionMutation,
  useUpdateSeccionMutation,
  useReorderSeccionesMutation,
  useCreateCampoMutation,
  useUpdateCampoMutation,
  useReorderCamposMutation,
} from '@api/tiposTramiteApi';
import { useGetOficinasQuery } from '@api/oficinasApi';
import { Button, Card, Input, Spinner } from '@components/atoms';
import { cn } from '@utils/helpers';

// ── Constants ────────────────────────────────────────────────────────────────

const TIPOS_CAMPO = [
  { value: 'text',           label: 'Texto corto' },
  { value: 'textarea',       label: 'Texto largo' },
  { value: 'number',         label: 'Número' },
  { value: 'date',           label: 'Fecha' },
  { value: 'select',         label: 'Lista desplegable' },
  { value: 'radio',          label: 'Opción única (radio)' },
  { value: 'checkbox_group', label: 'Casillas múltiples' },
  { value: 'file',           label: 'Archivo adjunto' },
  { value: 'checkbox',       label: 'Casilla de verificación' },
];

const TIPO_CAMPO_LABEL = Object.fromEntries(TIPOS_CAMPO.map(t => [t.value, t.label]));

const TIPOS_CON_OPCIONES  = ['select', 'radio', 'checkbox_group'];
const TIPOS_CON_LONGITUD  = ['text', 'textarea'];
const TIPOS_CON_RANGO     = ['number'];
const TIPOS_CON_ARCHIVO   = ['file'];
const TIPOS_CON_PLACEHOLDER = ['text', 'textarea', 'number'];

// ── Yup schemas ──────────────────────────────────────────────────────────────

const metaSchema = yup.object({
  nombre:      yup.string().min(5, 'Mínimo 5 caracteres').max(100).required('Requerido'),
  descripcion: yup.string().min(20, 'Mínimo 20 caracteres').max(1000).required('Requerido'),
});

const seccionSchema = yup.object({
  titulo:      yup.string().min(3, 'Mínimo 3 caracteres').max(100).required('Requerido'),
  descripcion: yup.string().max(500),
});

const campoSchema = yup.object({
  nombre:              yup.string()
    .matches(/^[a-z][a-z0-9_]*$/, 'Solo minúsculas, números y guiones bajos, comenzando con letra')
    .max(80).required('Requerido'),
  etiqueta:            yup.string().max(100).required('Requerido'),
  tipo:                yup.string().required('Requerido'),
  obligatorio:         yup.boolean(),
  placeholder:         yup.string().max(200),
  descripcion:         yup.string().max(500),
  opciones_texto:      yup.string(),
  min_length:          yup.number().integer().min(0).nullable().transform(v => (isNaN(v) ? null : v)),
  max_length:          yup.number().integer().min(1).nullable().transform(v => (isNaN(v) ? null : v)),
  min:                 yup.number().nullable().transform(v => (isNaN(v) ? null : v)),
  max:                 yup.number().nullable().transform(v => (isNaN(v) ? null : v)),
  permitir_decimales:  yup.boolean(),
  tipos_archivo_texto: yup.string(),
  multiples_archivos:  yup.boolean(),
});

// ── Data helpers ─────────────────────────────────────────────────────────────

const campoToForm = (campo) => ({
  nombre:              campo?.nombre               ?? '',
  etiqueta:            campo?.etiqueta             ?? '',
  tipo:                campo?.tipo                 ?? 'text',
  obligatorio:         campo?.obligatorio          ?? false,
  placeholder:         campo?.placeholder          ?? '',
  descripcion:         campo?.descripcion          ?? '',
  opciones_texto:      (campo?.opciones ?? []).join('\n'),
  min_length:          campo?.validaciones?.min_length          ?? '',
  max_length:          campo?.validaciones?.max_length          ?? '',
  min:                 campo?.validaciones?.min                 ?? '',
  max:                 campo?.validaciones?.max                 ?? '',
  permitir_decimales:  campo?.validaciones?.permitir_decimales  ?? false,
  tipos_archivo_texto: (campo?.validaciones?.tipos_archivo ?? []).join(', '),
  multiples_archivos:  campo?.validaciones?.multiples_archivos  ?? false,
});

const formToCampoPayload = (data) => {
  const payload = {
    nombre:      data.nombre,
    etiqueta:    data.etiqueta,
    tipo:        data.tipo,
    obligatorio: data.obligatorio ?? false,
    placeholder: data.placeholder || undefined,
    descripcion: data.descripcion || undefined,
  };
  if (TIPOS_CON_OPCIONES.includes(data.tipo)) {
    payload.opciones = (data.opciones_texto || '').split('\n').map(s => s.trim()).filter(Boolean);
  }
  const val = {};
  if (TIPOS_CON_LONGITUD.includes(data.tipo)) {
    if (data.min_length !== '' && data.min_length != null) val.min_length = Number(data.min_length);
    if (data.max_length !== '' && data.max_length != null) val.max_length = Number(data.max_length);
  }
  if (TIPOS_CON_RANGO.includes(data.tipo)) {
    if (data.min !== '' && data.min != null) val.min = Number(data.min);
    if (data.max !== '' && data.max != null) val.max = Number(data.max);
    if (data.permitir_decimales) val.permitir_decimales = true;
  }
  if (TIPOS_CON_ARCHIVO.includes(data.tipo)) {
    const arr = (data.tipos_archivo_texto || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    if (arr.length) val.tipos_archivo = arr;
    if (data.multiples_archivos) val.multiples_archivos = true;
  }
  if (Object.keys(val).length) payload.validaciones = val;
  return payload;
};

// ── Shared modal wrapper ──────────────────────────────────────────────────────

const ModalOverlay = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => (
  <Transition show={isOpen} as={Fragment}>
    <Dialog onClose={onClose} className="relative z-50">
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
        leave="ease-in duration-150"  leaveFrom="opacity-100" leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-shadow/40 backdrop-blur-sm" aria-hidden="true" />
      </Transition.Child>
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
          leave="ease-in duration-150"  leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
        >
          <Dialog.Panel className={cn('w-full bg-surface-container-low/95 backdrop-blur-glass rounded-lg shadow-ambient-lg my-8', maxWidth)}>
            <div className="px-6 pt-5 pb-3 border-b border-outline-variant/20">
              <Dialog.Title className="text-title-lg text-on-surface font-medium">{title}</Dialog.Title>
            </div>
            <div className="px-6 py-5 space-y-4">{children}</div>
          </Dialog.Panel>
        </Transition.Child>
      </div>
    </Dialog>
  </Transition>
);

// ── Meta modal ────────────────────────────────────────────────────────────────

const MetaModal = ({ isOpen, initial, onClose, onSave, isSaving }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(metaSchema),
    defaultValues: { nombre: '', descripcion: '' },
  });
  useEffect(() => {
    if (isOpen) reset({ nombre: initial?.nombre ?? '', descripcion: initial?.descripcion ?? '' });
  }, [isOpen, initial, reset]);

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title="Editar información">
      <form onSubmit={handleSubmit(onSave)} className="space-y-4">
        <Input label="Nombre" required error={errors.nombre?.message} {...register('nombre')} />
        <div>
          <label className="block text-label-md text-on-surface-variant mb-1.5 font-medium">
            Descripción <span className="text-error">*</span>
          </label>
          <textarea
            {...register('descripcion')}
            rows={4}
            className="w-full px-3 py-2 rounded border border-outline-variant bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
          />
          {errors.descripcion && <p className="mt-1 text-label-sm text-error">{errors.descripcion.message}</p>}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSaving}>Guardar</Button>
        </div>
      </form>
    </ModalOverlay>
  );
};

// ── Sección modal ─────────────────────────────────────────────────────────────

const SeccionModal = ({ isOpen, initial, onClose, onSave, isSaving }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(seccionSchema),
    defaultValues: { titulo: '', descripcion: '' },
  });
  useEffect(() => {
    if (isOpen) reset({ titulo: initial?.titulo ?? '', descripcion: initial?.descripcion ?? '' });
  }, [isOpen, initial, reset]);

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title={initial ? 'Editar Sección' : 'Nueva Sección'}>
      <form onSubmit={handleSubmit(onSave)} className="space-y-4">
        <Input label="Título" required error={errors.titulo?.message} {...register('titulo')} />
        <div>
          <label className="block text-label-md text-on-surface-variant mb-1.5 font-medium">
            Instrucciones / descripción
          </label>
          <textarea
            {...register('descripcion')}
            rows={3}
            placeholder="Instrucciones para el solicitante (opcional)"
            className="w-full px-3 py-2 rounded border border-outline-variant bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
          />
          {errors.descripcion && <p className="mt-1 text-label-sm text-error">{errors.descripcion.message}</p>}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSaving}>{initial ? 'Guardar' : 'Crear Sección'}</Button>
        </div>
      </form>
    </ModalOverlay>
  );
};

// ── Campo modal ───────────────────────────────────────────────────────────────

const CampoModal = ({ isOpen, initial, onClose, onSave, isSaving }) => {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    resolver: yupResolver(campoSchema),
    defaultValues: campoToForm(null),
  });
  const tipoActual = useWatch({ control, name: 'tipo' });

  useEffect(() => {
    if (isOpen) reset(campoToForm(initial ?? null));
  }, [isOpen, initial, reset]);

  const conOpciones    = TIPOS_CON_OPCIONES.includes(tipoActual);
  const conLongitud    = TIPOS_CON_LONGITUD.includes(tipoActual);
  const conRango       = TIPOS_CON_RANGO.includes(tipoActual);
  const conArchivo     = TIPOS_CON_ARCHIVO.includes(tipoActual);
  const conPlaceholder = TIPOS_CON_PLACEHOLDER.includes(tipoActual);

  const onSubmit = (data) => onSave(formToCampoPayload(data));

  return (
    <ModalOverlay
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? 'Editar Campo' : 'Nuevo Campo'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Nombre interno"
              required
              placeholder="ej: razon_social"
              error={errors.nombre?.message}
              disabled={!!initial}
              {...register('nombre')}
            />
            <p className="mt-1 text-label-sm text-on-surface-variant">
              Minúsculas, números y guiones bajos
            </p>
          </div>
          <Input
            label="Etiqueta visible"
            required
            placeholder="ej: Razón Social"
            error={errors.etiqueta?.message}
            {...register('etiqueta')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1.5 font-medium">
              Tipo de campo <span className="text-error">*</span>
            </label>
            <select
              {...register('tipo')}
              className="w-full h-10 px-3 rounded border border-outline-variant bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {TIPOS_CAMPO.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer mt-7">
            <input type="checkbox" {...register('obligatorio')} className="rounded text-primary" />
            <span className="text-body-md text-on-surface">Campo obligatorio</span>
          </label>
        </div>

        <div>
          <label className="block text-label-md text-on-surface-variant mb-1.5 font-medium">
            Texto de ayuda
          </label>
          <textarea
            {...register('descripcion')}
            rows={2}
            placeholder="Aclaración o instrucción para el usuario (opcional)"
            className="w-full px-3 py-2 rounded border border-outline-variant bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
          />
        </div>

        {conPlaceholder && (
          <Input
            label="Placeholder"
            placeholder="Texto de ejemplo dentro del campo"
            error={errors.placeholder?.message}
            {...register('placeholder')}
          />
        )}

        {conOpciones && (
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1.5 font-medium">
              Opciones <span className="text-label-sm font-normal">(una por línea)</span>
            </label>
            <textarea
              {...register('opciones_texto')}
              rows={5}
              placeholder={'Opción A\nOpción B\nOpción C'}
              className="w-full px-3 py-2 rounded border border-outline-variant bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y font-mono text-sm"
            />
          </div>
        )}

        {conLongitud && (
          <div className="grid grid-cols-2 gap-4">
            <Input label="Mínimo de caracteres" type="number" min="0" {...register('min_length')} />
            <Input label="Máximo de caracteres" type="number" min="1" {...register('max_length')} />
          </div>
        )}

        {conRango && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Valor mínimo" type="number" {...register('min')} />
              <Input label="Valor máximo" type="number" {...register('max')} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('permitir_decimales')} className="rounded text-primary" />
              <span className="text-body-md text-on-surface">Permitir decimales</span>
            </label>
          </div>
        )}

        {conArchivo && (
          <div className="space-y-3">
            <Input
              label="Tipos de archivo permitidos (separados por coma)"
              placeholder="pdf, jpg, png, docx"
              {...register('tipos_archivo_texto')}
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('multiples_archivos')} className="rounded text-primary" />
              <span className="text-body-md text-on-surface">Permitir múltiples archivos</span>
            </label>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2 border-t border-outline-variant/20">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSaving}>{initial ? 'Guardar' : 'Agregar Campo'}</Button>
        </div>
      </form>
    </ModalOverlay>
  );
};

// ── Estado styles ─────────────────────────────────────────────────────────────

const ESTADO_STYLES = {
  borrador: 'bg-surface-container text-on-surface-variant',
  activo:   'bg-tertiary-fixed text-on-tertiary-fixed',
  inactivo: 'bg-error-container text-on-error-container',
};

// ── Main component ────────────────────────────────────────────────────────────

const TipoTramiteBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: tipo, isLoading } = useGetTipoTramiteQuery(id);
  const { data: oficinasData }    = useGetOficinasQuery({ limit: 100, estado: 'activa' });
  const oficinas = oficinasData?.data ?? [];

  const [updateTipo,   { isLoading: savingMeta }]   = useUpdateTipoTramiteMutation();
  const [activarTipo,  { isLoading: activando }]    = useActivarTipoTramiteMutation();
  const [nuevaVersion, { isLoading: versionando }]  = useNuevaVersionTipoTramiteMutation();
  const [setAsignacion,{ isLoading: savingAsig }]   = useSetModoAsignacionMutation();

  const [createSeccion, { isLoading: creandoSec }]    = useCreateSeccionMutation();
  const [updateSeccion, { isLoading: actualizandoSec }] = useUpdateSeccionMutation();
  const [reorderSecciones] = useReorderSeccionesMutation();

  const [createCampo, { isLoading: creandoCampo }]     = useCreateCampoMutation();
  const [updateCampo, { isLoading: actualizandoCampo }] = useUpdateCampoMutation();
  const [reorderCampos] = useReorderCamposMutation();

  // ── Modal state ──────────────────────────────────────────────────────────
  const [metaModal,        setMetaModal]        = useState(false);
  const [seccionModal,     setSeccionModal]     = useState(null); // null | { seccion? }
  const [campoModal,       setCampoModal]       = useState(null); // null | { seccionId, campo? }

  // ── Asignación local state ───────────────────────────────────────────────
  const [modoAsig, setModoAsig]           = useState('manual');
  const [selectedOficinas, setSelectedOficinas] = useState([]);

  useEffect(() => {
    if (tipo) {
      setModoAsig(tipo.modo_asignacion ?? 'manual');
      setSelectedOficinas((tipo.oficinas_asignacion ?? []).map(o => o.oficina_id));
    }
  }, [tipo]);

  const toggleOficina = (ofId) =>
    setSelectedOficinas(prev =>
      prev.includes(ofId) ? prev.filter(x => x !== ofId) : [...prev, ofId]
    );

  // ── Helpers ──────────────────────────────────────────────────────────────
  const isBorrador = tipo?.estado === 'borrador';

  const moveSeccion = async (seccion, dir) => {
    const list = tipo?.secciones ?? [];
    const idx  = list.findIndex(s => s.id === seccion.id);
    if ((dir === 'up' && idx === 0) || (dir === 'down' && idx === list.length - 1)) return;
    const ids  = list.map(s => s.id);
    const swap = dir === 'up' ? idx - 1 : idx + 1;
    [ids[idx], ids[swap]] = [ids[swap], ids[idx]];
    try { await reorderSecciones({ tipoId: id, ids }).unwrap(); }
    catch { toast.error('Error al reordenar secciones'); }
  };

  const moveCampo = async (campo, seccionId, dir) => {
    const sec   = tipo?.secciones?.find(s => s.id === seccionId);
    const list  = sec?.campos ?? [];
    const idx   = list.findIndex(c => c.id === campo.id);
    if ((dir === 'up' && idx === 0) || (dir === 'down' && idx === list.length - 1)) return;
    const ids  = list.map(c => c.id);
    const swap = dir === 'up' ? idx - 1 : idx + 1;
    [ids[idx], ids[swap]] = [ids[swap], ids[idx]];
    try { await reorderCampos({ tipoId: id, seccionId, ids }).unwrap(); }
    catch { toast.error('Error al reordenar campos'); }
  };

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSaveMeta = async (data) => {
    try {
      await updateTipo({ id, ...data }).unwrap();
      toast.success('Información actualizada');
      setMetaModal(false);
    } catch (err) { toast.error(err.data?.message ?? 'Error al guardar'); }
  };

  const handleActivar = async () => {
    try {
      await activarTipo(id).unwrap();
      toast.success('Tipo de trámite activado');
    } catch (err) {
      toast.error(err.data?.message ?? 'Error al activar — verificá que tenga al menos una sección con campos');
    }
  };

  const handleNuevaVersion = async () => {
    try {
      const nuevo = await nuevaVersion(id).unwrap();
      toast.success(`Nueva versión v${nuevo.version} creada`);
      navigate(`/tipos-tramite/${nuevo.id}/configurar`);
    } catch (err) { toast.error(err.data?.message ?? 'Error al crear nueva versión'); }
  };

  const handleSaveAsignacion = async () => {
    const payload = { id, modo_asignacion: modoAsig };
    if (modoAsig === 'automatico') payload.oficinas_ids = selectedOficinas;
    try {
      await setAsignacion(payload).unwrap();
      toast.success('Asignación guardada');
    } catch (err) { toast.error(err.data?.message ?? 'Error al guardar asignación'); }
  };

  const handleSaveSeccion = async (data) => {
    try {
      if (seccionModal?.seccion) {
        await updateSeccion({ tipoId: id, seccionId: seccionModal.seccion.id, ...data }).unwrap();
        toast.success('Sección actualizada');
      } else {
        await createSeccion({ tipoId: id, ...data }).unwrap();
        toast.success('Sección creada');
      }
      setSeccionModal(null);
    } catch (err) { toast.error(err.data?.message ?? 'Error al guardar sección'); }
  };

  const handleSaveCampo = async (payload) => {
    try {
      if (campoModal?.campo) {
        await updateCampo({ tipoId: id, seccionId: campoModal.seccionId, campoId: campoModal.campo.id, ...payload }).unwrap();
        toast.success('Campo actualizado');
      } else {
        await createCampo({ tipoId: id, seccionId: campoModal.seccionId, ...payload }).unwrap();
        toast.success('Campo agregado');
      }
      setCampoModal(null);
    } catch (err) { toast.error(err.data?.message ?? 'Error al guardar campo'); }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (isLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!tipo)     return <div className="py-16 text-center text-body-md text-on-surface-variant">Tipo no encontrado.</div>;

  const secciones = tipo.secciones ?? [];

  return (
    <div className="space-y-6 max-w">

      {/* ── Header ── */}
      <div>
        <Link to="/tipos-tramite" className="text-label-sm text-on-surface-variant hover:underline">
          ← Tipos de Trámite
        </Link>
        <div className="flex items-start justify-between mt-1 gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-display-sm text-primary font-semibold">{tipo.nombre}</h1>
              <span className={cn('inline-flex px-2.5 py-0.5 rounded-full text-label-sm font-medium', ESTADO_STYLES[tipo.estado])}>
                {{ borrador: 'Borrador', activo: 'Activo', inactivo: 'Inactivo' }[tipo.estado] ?? tipo.estado}
              </span>
              <span className="text-label-sm text-on-surface-variant font-mono">v{tipo.version}</span>
            </div>
            <p className="text-label-sm text-on-surface-variant font-mono mt-0.5">{tipo.codigo}</p>
            {tipo.descripcion && (
              <p className="text-body-sm text-on-surface-variant mt-1 max-w-xl">{tipo.descripcion}</p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0 flex-wrap">
            {isBorrador && (
              <>
                <Button variant="secondary" size="sm" onClick={() => setMetaModal(true)}>
                  Editar info
                </Button>
                <Button variant="tertiary" size="sm" onClick={handleActivar} isLoading={activando}>
                  Activar
                </Button>
              </>
            )}
            {tipo.estado === 'activo' && (
              <Button variant="secondary" size="sm" onClick={handleNuevaVersion} isLoading={versionando}>
                Nueva Versión
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Asignación ── */}
      <Card elevated>
        <div className="p-5 space-y-4">
          <h2 className="text-title-md text-on-surface font-medium">Asignación de trámites</h2>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1.5 font-medium">
                Modo de asignación
              </label>
              <select
                value={modoAsig}
                onChange={(e) => setModoAsig(e.target.value)}
                className="h-10 px-3 rounded border border-outline-variant bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 w-56"
              >
                <option value="manual">Manual (por moderador)</option>
                <option value="automatico">Automático (por oficina)</option>
              </select>
            </div>
            <Button size="sm" onClick={handleSaveAsignacion} isLoading={savingAsig}>
              Guardar
            </Button>
          </div>

          {modoAsig === 'automatico' && (
            <div>
              <p className="text-label-md text-on-surface-variant mb-2 font-medium">
                Oficinas que reciben este trámite automáticamente
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {oficinas.map((o) => (
                  <label key={o.id} className="flex items-center gap-2 cursor-pointer text-body-sm">
                    <input
                      type="checkbox"
                      checked={selectedOficinas.includes(o.id)}
                      onChange={() => toggleOficina(o.id)}
                      className="rounded text-primary"
                    />
                    <span className="text-on-surface">{o.nombre}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ── Secciones ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-title-lg text-on-surface font-medium">
            Secciones del formulario
            {secciones.length > 0 && (
              <span className="ml-2 text-body-md text-on-surface-variant font-normal">
                ({secciones.length})
              </span>
            )}
          </h2>
          {isBorrador && (
            <Button size="sm" onClick={() => setSeccionModal({})}>
              <PlusIcon className="h-4 w-4 mr-1 inline-block" />
              Agregar Sección
            </Button>
          )}
        </div>

        {secciones.length === 0 ? (
          <div className="py-12 text-center text-body-md text-on-surface-variant italic bg-surface-container-low rounded">
            {isBorrador
              ? 'Sin secciones todavía. Agregá una para construir el formulario.'
              : 'Este tipo no tiene secciones definidas.'}
          </div>
        ) : (
          <div className="space-y-4">
            {secciones.map((sec, secIdx) => {
              const campos = sec.campos ?? [];
              return (
                <Card key={sec.id} elevated>
                  {/* Sección header */}
                  <div className="px-5 py-3 flex items-start justify-between gap-3 bg-surface-container border-b border-outline-variant/20">
                    <div className="flex-1 min-w-0">
                      <p className="text-title-sm font-medium text-on-surface">
                        <span className="text-on-surface-variant text-label-sm mr-2">{secIdx + 1}.</span>
                        {sec.titulo}
                      </p>
                      {sec.descripcion && (
                        <p className="text-label-sm text-on-surface-variant mt-0.5">{sec.descripcion}</p>
                      )}
                    </div>
                    {isBorrador && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          disabled={secIdx === 0}
                          onClick={() => moveSeccion(sec, 'up')}
                          className="p-1.5 rounded hover:bg-surface-container-low disabled:opacity-30 transition-colors"
                          title="Subir"
                        >
                          <ChevronUpIcon className="h-4 w-4 text-on-surface-variant" />
                        </button>
                        <button
                          disabled={secIdx === secciones.length - 1}
                          onClick={() => moveSeccion(sec, 'down')}
                          className="p-1.5 rounded hover:bg-surface-container-low disabled:opacity-30 transition-colors"
                          title="Bajar"
                        >
                          <ChevronDownIcon className="h-4 w-4 text-on-surface-variant" />
                        </button>
                        <button
                          onClick={() => setSeccionModal({ seccion: sec })}
                          className="p-1.5 rounded hover:bg-surface-container-low transition-colors"
                          title="Editar"
                        >
                          <PencilIcon className="h-4 w-4 text-on-surface-variant" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Campos */}
                  <div className="divide-y divide-outline-variant/10">
                    {campos.length === 0 ? (
                      <p className="px-5 py-3 text-label-sm text-on-surface-variant italic">
                        Sin campos en esta sección.
                      </p>
                    ) : (
                      campos.map((campo, campoIdx) => (
                        <div
                          key={campo.id}
                          className="px-5 py-2.5 flex items-center justify-between gap-3 hover:bg-surface-container-low transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="text-label-sm text-on-surface-variant w-5 flex-shrink-0 text-right">
                              {campoIdx + 1}.
                            </span>
                            <span className="inline-flex px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-label-sm font-mono flex-shrink-0">
                              {TIPO_CAMPO_LABEL[campo.tipo] ?? campo.tipo}
                            </span>
                            <div className="min-w-0">
                              <span className="text-body-sm text-on-surface font-medium">{campo.etiqueta}</span>
                              <span className="text-label-sm text-on-surface-variant font-mono ml-2 hidden sm:inline">
                                {campo.nombre}
                              </span>
                              {campo.obligatorio && (
                                <span className="ml-1 text-error text-label-sm font-bold" title="Obligatorio">*</span>
                              )}
                            </div>
                          </div>
                          {isBorrador && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                disabled={campoIdx === 0}
                                onClick={() => moveCampo(campo, sec.id, 'up')}
                                className="p-1 rounded hover:bg-surface-container disabled:opacity-30 transition-colors"
                              >
                                <ChevronUpIcon className="h-3.5 w-3.5 text-on-surface-variant" />
                              </button>
                              <button
                                disabled={campoIdx === campos.length - 1}
                                onClick={() => moveCampo(campo, sec.id, 'down')}
                                className="p-1 rounded hover:bg-surface-container disabled:opacity-30 transition-colors"
                              >
                                <ChevronDownIcon className="h-3.5 w-3.5 text-on-surface-variant" />
                              </button>
                              <button
                                onClick={() => setCampoModal({ seccionId: sec.id, campo })}
                                className="p-1 rounded hover:bg-surface-container transition-colors"
                              >
                                <PencilIcon className="h-3.5 w-3.5 text-on-surface-variant" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add campo */}
                  {isBorrador && (
                    <div className="px-5 py-2.5 border-t border-outline-variant/10">
                      <button
                        onClick={() => setCampoModal({ seccionId: sec.id })}
                        className="flex items-center gap-1.5 text-label-sm text-primary hover:text-primary/70 transition-colors"
                      >
                        <PlusIcon className="h-4 w-4" />
                        Agregar campo
                      </button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <MetaModal
        isOpen={metaModal}
        initial={tipo}
        onClose={() => setMetaModal(false)}
        onSave={handleSaveMeta}
        isSaving={savingMeta}
      />
      <SeccionModal
        isOpen={!!seccionModal}
        initial={seccionModal?.seccion}
        onClose={() => setSeccionModal(null)}
        onSave={handleSaveSeccion}
        isSaving={creandoSec || actualizandoSec}
      />
      <CampoModal
        isOpen={!!campoModal}
        initial={campoModal?.campo}
        onClose={() => setCampoModal(null)}
        onSave={handleSaveCampo}
        isSaving={creandoCampo || actualizandoCampo}
      />
    </div>
  );
};

export default TipoTramiteBuilder;
