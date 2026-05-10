import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Input, Textarea, Select, Card } from '@components/atoms';
import { FileUpload } from '@components/molecules';
import { uploadArchivo } from '@api/archivosApi';

// ── File field (own useState for upload progress) ──────────────────────────────
const FileField = ({ campo, seccion_id, tramite_id, control }) => {
  const [uploading, setUploading] = useState(false);
  return (
    <Controller
      name={`campos.${campo.id}`}
      control={control}
      render={({ field: { onChange, value } }) => (
        <FileUpload
          label={campo.etiqueta}
          required={campo.obligatorio}
          currentFile={value ?? null}
          onFileSelect={async (file) => {
            if (!tramite_id) { onChange(file); return; }
            setUploading(true);
            try {
              const { data } = await uploadArchivo({ tramite_id, seccion_id, file });
              onChange(data);
              toast.success('Archivo subido');
            } catch {
              toast.error('Error al subir el archivo');
            } finally {
              setUploading(false);
            }
          }}
          onRemove={() => onChange(null)}
        />
      )}
    />
  );
};

// ── Dynamic field dispatcher ───────────────────────────────────────────────────
const DynamicField = ({ campo, seccion_id, tramite_id, register, control, errors }) => {
  const error = errors?.campos?.[campo.id]?.message;
  const fieldName = `campos.${campo.id}`;
  const rules = campo.obligatorio ? { required: `${campo.etiqueta} es requerido` } : {};

  if (campo.tipo === 'file') {
    return (
      <FileField
        campo={campo}
        seccion_id={seccion_id}
        tramite_id={tramite_id}
        control={control}
      />
    );
  }

  if (campo.tipo === 'textarea') {
    return (
      <Textarea
        label={campo.etiqueta}
        error={error}
        required={campo.obligatorio}
        {...register(fieldName, rules)}
      />
    );
  }

  if (campo.tipo === 'select') {
    const options = (campo.opciones ?? []).map((o) => ({ value: o, label: o }));
    return (
      <Controller
        name={fieldName}
        control={control}
        rules={rules}
        render={({ field }) => (
          <Select
            label={campo.etiqueta}
            options={options}
            error={error}
            required={campo.obligatorio}
            {...field}
          />
        )}
      />
    );
  }

  if (campo.tipo === 'checkbox') {
    return (
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded accent-primary"
            {...register(fieldName, rules)}
          />
          <span className="text-body-md text-on-surface">
            {campo.etiqueta}
            {campo.obligatorio && <span className="text-error ml-1">*</span>}
          </span>
        </label>
        {error && <p className="text-label-sm text-error mt-1">{error}</p>}
      </div>
    );
  }

  if (campo.tipo === 'radio') {
    return (
      <fieldset>
        <legend className="text-label-md text-on-surface-variant mb-2">
          {campo.etiqueta}
          {campo.obligatorio && <span className="text-error ml-1">*</span>}
        </legend>
        <div className="flex flex-wrap gap-4">
          {(campo.opciones ?? []).map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value={opt}
                className="accent-primary"
                {...register(fieldName, rules)}
              />
              <span className="text-body-md text-on-surface">{opt}</span>
            </label>
          ))}
        </div>
        {error && <p className="text-label-sm text-error mt-1">{error}</p>}
      </fieldset>
    );
  }

  // Default: text, number, date
  return (
    <Input
      label={campo.etiqueta}
      type={campo.tipo === 'number' ? 'number' : campo.tipo === 'date' ? 'date' : 'text'}
      error={error}
      required={campo.obligatorio}
      {...register(fieldName, rules)}
    />
  );
};

// ── Full sections renderer ─────────────────────────────────────────────────────
// seccionesACorregir: array of seccion IDs that the decisor marked for correction.
// When non-empty, only those sections are editable; the rest are locked.
const TramiteFormSections = ({
  secciones = [],
  register,
  control,
  errors,
  tramite_id,
  seccionesACorregir = [],
}) => {
  const enCorreccion = seccionesACorregir.length > 0;
  const setCorregir = new Set(seccionesACorregir);

  return (
    <div className="space-y-6">
      {secciones.map((sec) => {
        const requiereCorreccion = enCorreccion && setCorregir.has(sec.id);
        const bloqueada = enCorreccion && !setCorregir.has(sec.id);

        return (
          <Card key={sec.id} elevated>
            <div
              className={
                requiereCorreccion
                  ? 'border-l-4 border-amber-500 rounded overflow-hidden'
                  : bloqueada
                  ? 'opacity-50 rounded overflow-hidden'
                  : 'rounded overflow-hidden'
              }
            >
              <div className="p-6 space-y-4">
                {/* Header sección */}
                <div className="border-b border-outline-variant/30 pb-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-label-sm text-on-surface-variant font-medium uppercase tracking-wide">
                        Sección {sec.orden}
                      </p>
                      <h3 className="text-title-md text-on-surface font-medium mt-0.5">{sec.titulo}</h3>
                      {sec.descripcion && (
                        <p className="text-body-sm text-on-surface-variant mt-1">{sec.descripcion}</p>
                      )}
                    </div>
                    {requiereCorreccion && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-label-sm font-semibold bg-amber-500 text-white shrink-0">
                        Requiere corrección
                      </span>
                    )}
                    {bloqueada && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-label-sm font-medium bg-surface-container text-on-surface-variant shrink-0">
                        Sin cambios requeridos
                      </span>
                    )}
                  </div>
                </div>

                {/* Campos */}
                <div
                  className={bloqueada ? 'pointer-events-none select-none' : ''}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(sec.campos ?? []).map((campo) => (
                      <div
                        key={campo.id}
                        className={
                          ['textarea', 'file', 'radio', 'checkbox'].includes(campo.tipo)
                            ? 'md:col-span-2'
                            : ''
                        }
                      >
                        <DynamicField
                          campo={campo}
                          seccion_id={sec.id}
                          tramite_id={tramite_id}
                          register={register}
                          control={control}
                          errors={errors}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default TramiteFormSections;
