import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useCreateTramiteMutation } from '@api/tramitesApi';
import { useGetTiposTramiteQuery, useGetTipoTramiteQuery } from '@api/tiposTramiteApi';
import { useAuth } from '@hooks/useAuth';
import { Button, Card, Select, Spinner } from '@components/atoms';
import { TramiteFormSections } from '@components/organisms';

// Transforms flat campos map → secciones array expected by the backend
const buildSecciones = (tipoTramite, camposValues) =>
  (tipoTramite?.secciones ?? []).map((sec) => ({
    seccion_id: sec.id,
    campos: (sec.campos ?? [])
      .map((campo) => ({ campo_id: campo.id, valor: camposValues[campo.id] ?? null }))
      .filter((c) => c.valor !== null && c.valor !== ''),
  }));

const TramiteCrear = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTipoId, setSelectedTipoId] = useState('');

  const { data: tipos, isLoading: tiposLoading } = useGetTiposTramiteQuery();
  const { data: tipoTramite, isLoading: tipoLoading } = useGetTipoTramiteQuery(selectedTipoId, {
    skip: !selectedTipoId,
  });

  const [createTramite, { isLoading: saving }] = useCreateTramiteMutation();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { campos: {} } });

  const onSubmit = async ({ campos }) => {
    try {
      const result = await createTramite({
        tipo_tramite_id: selectedTipoId,
        empresa_id: user?.empresa_id,
        solicitante_id: user?.id,
        secciones: buildSecciones(tipoTramite, campos),
      }).unwrap();
      toast.success('Trámite guardado como borrador');
      navigate(`/tramites/${result.id}`);
    } catch (err) {
      toast.error(err.data?.message ?? 'Error al crear el trámite');
    }
  };

  const tipoOptions = (tipos?.data ?? []).map((t) => ({ value: t.id, label: t.nombre }));

  return (
    <div className="space-y-6 max-w">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/tramites" className="text-label-sm text-on-surface-variant hover:underline">
            ← Trámites
          </Link>
          <h1 className="text-display-sm text-primary font-semibold mt-1">Nuevo Trámite</h1>
        </div>
      </div>

      {/* TipoTramite selector */}
      <Card elevated>
        <div className="p-6">
          {tiposLoading ? (
            <div className="flex justify-center py-4">
              <Spinner size="md" />
            </div>
          ) : (
            <Select
              label="Tipo de Trámite"
              required
              options={tipoOptions}
              value={selectedTipoId}
              onChange={(e) => setSelectedTipoId(e.target.value)}
            />
          )}
        </div>
      </Card>

      {/* Dynamic form — shown once a tipo is selected */}
      {selectedTipoId && (
        tipoLoading ? (
          <div className="flex justify-center py-10">
            <Spinner size="lg" />
          </div>
        ) : tipoTramite ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <TramiteFormSections
              secciones={tipoTramite.secciones ?? []}
              register={register}
              control={control}
              errors={errors}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Link to="/tramites">
                <Button variant="secondary" type="button">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" isLoading={saving}>
                Guardar Borrador
              </Button>
            </div>
          </form>
        ) : null
      )}
    </div>
  );
};

export default TramiteCrear;
