import { useFieldArray, useForm, Controller } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useGetTramiteQuery, useAsignarTramiteMutation } from '@api/tramitesApi';
import { useGetOficinasQuery } from '@api/oficinasApi';
import { useGetUsuariosQuery } from '@api/usuariosApi';
import { Button, Card, Select, Spinner } from '@components/atoms';

// ── Main page ──────────────────────────────────────────────────────────────────
const AsignarTramite = () => {
  const { tramite_id } = useParams();
  const navigate = useNavigate();

  const { data: tramite, isLoading: tramiteLoading } = useGetTramiteQuery(tramite_id);
  const { data: oficinas } = useGetOficinasQuery();
  const { data: todosLosJefes } = useGetUsuariosQuery({ rol: 'jefe_oficina' });

  const [asignar, { isLoading: assigning }] = useAsignarTramiteMutation();

  const { control, handleSubmit } = useForm({
    defaultValues: {
      oficinas: [{ oficina_id: '' }],
      jefe_decisor_id: '',
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'oficinas' });

  const oficinasOptions = (oficinas?.data ?? []).map((o) => ({ value: o.id, label: o.nombre }));
  const jefeOptions = (todosLosJefes?.data ?? []).map((u) => ({
    value: u.id,
    label: `${u.nombre} ${u.apellido}${u.oficina ? ` — ${u.oficina.nombre}` : ''}`,
  }));

  const onSubmit = async (data) => {
    const oficinasValidas = data.oficinas.filter((o) => o.oficina_id);
    if (oficinasValidas.length === 0) {
      toast.error('Seleccioná al menos una oficina');
      return;
    }
    if (!data.jefe_decisor_id) {
      toast.error('Seleccioná el jefe decisor');
      return;
    }
    try {
      await asignar({
        id: tramite_id,
        oficinas: oficinasValidas,
        jefe_decisor_id: data.jefe_decisor_id,
      }).unwrap();
      toast.success('Trámite asignado correctamente');
      navigate('/asignacion');
    } catch (err) {
      toast.error(err.data?.message ?? 'Error al asignar');
    }
  };

  if (tramiteLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link to="/asignacion" className="text-label-sm text-on-surface-variant hover:underline">
          ← Bandeja de Asignación
        </Link>
        <h1 className="text-display-sm text-primary font-semibold mt-1">Asignar Trámite</h1>
        <p className="text-body-md text-on-surface-variant">
          #{tramite?.numero} · {tramite?.tipo_tramite?.nombre}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Oficinas a evaluar */}
        <Card elevated>
          <div className="p-5 space-y-4">
            <p className="text-label-md text-on-surface-variant font-medium uppercase tracking-wide">
              Oficinas evaluadoras
            </p>
            <p className="text-body-sm text-on-surface-variant">
              Cualquier usuario interno de cada oficina podrá revisar el trámite.
              El jefe de cada oficina deberá aprobarlo cuando esté completo.
            </p>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-3">
                  <div className="flex-1">
                    <Controller
                      name={`oficinas.${index}.oficina_id`}
                      control={control}
                      rules={{ required: 'Seleccioná una oficina' }}
                      render={({ field: f, fieldState: { error } }) => (
                        <Select
                          label={`Oficina ${index + 1}`}
                          required
                          options={oficinasOptions}
                          error={error?.message}
                          {...f}
                        />
                      )}
                    />
                  </div>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="mb-1 text-label-sm text-error hover:underline shrink-0"
                    >
                      Quitar
                    </button>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => append({ oficina_id: '' })}
            >
              + Agregar oficina
            </Button>
          </div>
        </Card>

        {/* Jefe decisor global */}
        <Card elevated>
          <div className="p-5">
            <p className="text-label-md text-on-surface-variant font-medium uppercase tracking-wide mb-3">
              Jefe decisor final
            </p>
            <p className="text-body-sm text-on-surface-variant mb-4">
              Este usuario tomará la decisión final (aprobar, rechazar u observar) una vez que
              todas las oficinas completen su revisión.
            </p>
            <Controller
              name="jefe_decisor_id"
              control={control}
              rules={{ required: 'Seleccioná el jefe decisor' }}
              render={({ field, fieldState: { error } }) => (
                <Select
                  label="Jefe Decisor"
                  required
                  options={jefeOptions}
                  error={error?.message}
                  {...field}
                />
              )}
            />
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Link to="/asignacion">
            <Button variant="secondary" type="button">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" isLoading={assigning}>
            Confirmar Asignación
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AsignarTramite;
