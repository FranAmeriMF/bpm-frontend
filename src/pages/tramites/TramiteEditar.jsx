import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useGetTramiteQuery, useUpdateTramiteMutation, useReenviarTramiteMutation } from '@api/tramitesApi';
import { useGetTipoTramiteQuery } from '@api/tiposTramiteApi';
import { Button, Card, Spinner } from '@components/atoms';
import { TramiteFormSections } from '@components/organisms';

// Transforms flat campos map → secciones array
const buildSecciones = (tipoTramite, camposValues) =>
  (tipoTramite?.secciones ?? []).map((sec) => ({
    seccion_id: sec.id,
    campos: (sec.campos ?? [])
      .map((campo) => ({ campo_id: campo.id, valor: camposValues[campo.id] ?? null }))
      .filter((c) => c.valor !== null && c.valor !== ''),
  }));

// Flattens tramite.secciones_datos into { [campo_id]: valor } for RHF defaultValues
const extractCampos = (secciones_datos = []) =>
  secciones_datos.reduce((acc, sec) => {
    (sec.campos ?? []).forEach((c) => {
      acc[c.campo_id] = c.valor ?? '';
    });
    return acc;
  }, {});

const TramiteEditar = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: tramite, isLoading: tramiteLoading } = useGetTramiteQuery(id);
  const { data: tipoTramite, isLoading: tipoLoading } = useGetTipoTramiteQuery(
    tramite?.tipo_tramite_id,
    { skip: !tramite?.tipo_tramite_id },
  );

  const [updateTramite, { isLoading: saving }] = useUpdateTramiteMutation();
  const [reenviar, { isLoading: reenviando }] = useReenviarTramiteMutation();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { campos: {} } });

  // Pre-populate form once tramite loads
  useEffect(() => {
    if (tramite) {
      reset({ campos: extractCampos(tramite.secciones_datos) });
    }
  }, [tramite, reset]);

  const isCorrigiendo = tramite?.estado === 'corrigiendo';
  const seccionesACorregir = isCorrigiendo
    ? (tramite?.decision_final?.secciones_a_corregir ?? [])
    : [];

  const onGuardar = async ({ campos }) => {
    try {
      await updateTramite({
        id,
        secciones: buildSecciones(tipoTramite, campos),
      }).unwrap();
      toast.success('Cambios guardados');
      navigate(`/tramites/${id}`);
    } catch (err) {
      toast.error(err.data?.message ?? 'Error al guardar');
    }
  };

  const onReenviar = async ({ campos }) => {
    try {
      await reenviar({
        id,
        secciones: buildSecciones(tipoTramite, campos),
      }).unwrap();
      toast.success('Trámite reenviado a revisión');
      navigate(`/tramites/${id}`);
    } catch (err) {
      toast.error(err.data?.message ?? 'Error al reenviar');
    }
  };

  if (tramiteLoading || tipoLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!tramite || !tipoTramite) {
    return (
      <Card elevated>
        <div className="p-8 text-center text-on-surface-variant">Trámite no encontrado.</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w">
      {/* Header */}
      <div>
        <Link to={`/tramites/${id}`} className="text-label-sm text-on-surface-variant hover:underline">
          ← #{tramite.numero}
        </Link>
        <h1 className="text-display-sm text-primary font-semibold mt-1">
          {isCorrigiendo ? 'Corregir Trámite' : 'Editar Trámite'}
        </h1>
        <p className="text-body-md text-on-surface-variant">{tipoTramite.nombre}</p>
      </div>

      <form className="space-y-6">
        <TramiteFormSections
          secciones={tipoTramite.secciones ?? []}
          register={register}
          control={control}
          errors={errors}
          tramite_id={id}
          seccionesACorregir={seccionesACorregir}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Link to={`/tramites/${id}`}>
            <Button variant="secondary" type="button">
              Cancelar
            </Button>
          </Link>
          <Button
            variant="secondary"
            type="button"
            isLoading={saving}
            onClick={handleSubmit(onGuardar)}
          >
            Guardar Cambios
          </Button>
          {isCorrigiendo && (
            <Button
              type="button"
              isLoading={reenviando}
              onClick={handleSubmit(onReenviar)}
            >
              Guardar y Reenviar
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TramiteEditar;
