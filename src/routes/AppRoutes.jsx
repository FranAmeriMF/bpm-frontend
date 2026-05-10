import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout, AuthLayout } from '@components/templates';
import { Spinner } from '@components/atoms';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
const Login           = lazy(() => import('@pages/Login'));
const ChangePassword  = lazy(() => import('@pages/ChangePassword'));
const ForgotPassword  = lazy(() => import('@pages/ForgotPassword'));
const ResetPassword   = lazy(() => import('@pages/ResetPassword'));
const Dashboard       = lazy(() => import('@pages/Dashboard'));

const TramitesLista  = lazy(() => import('@pages/tramites/TramitesLista'));
const TramiteDetalle = lazy(() => import('@pages/tramites/TramiteDetalle'));
const TramiteCrear   = lazy(() => import('@pages/tramites/TramiteCrear'));
const TramiteEditar  = lazy(() => import('@pages/tramites/TramiteEditar'));

const BandejaDirector       = lazy(() => import('@pages/director/BandejaDirector'));
const TramitesEmpresa       = lazy(() => import('@pages/director/TramitesEmpresa'));
const UsuariosEmpresa       = lazy(() => import('@pages/director/UsuariosEmpresa'));
const OficinasEmpresaLista  = lazy(() => import('@pages/director/OficinasEmpresaLista'));
const OficinaEmpresaForm    = lazy(() => import('@pages/director/OficinaEmpresaForm'));

const BandejaAsignacion = lazy(() => import('@pages/moderador/BandejaAsignacion'));
const AsignarTramite    = lazy(() => import('@pages/moderador/AsignarTramite'));

const MisRevisiones  = lazy(() => import('@pages/revisiones/MisRevisiones'));
const RevisarTramite = lazy(() => import('@pages/revisiones/RevisarTramite'));

const BandejaFinal   = lazy(() => import('@pages/decisor/BandejaFinal'));
const TomarDecision  = lazy(() => import('@pages/decisor/TomarDecision'));

const EmpresasLista  = lazy(() => import('@pages/admin/EmpresasLista'));
const EmpresaForm    = lazy(() => import('@pages/admin/EmpresaForm'));
const OficinasLista  = lazy(() => import('@pages/admin/OficinasLista'));
const OficinaForm    = lazy(() => import('@pages/admin/OficinaForm'));
const TiposTramiteLista     = lazy(() => import('@pages/admin/TiposTramiteLista'));
const TipoTramiteNuevoForm  = lazy(() => import('@pages/admin/TipoTramiteNuevoForm'));
const TipoTramiteBuilder    = lazy(() => import('@pages/admin/TipoTramiteBuilder'));
const PlantillasLista       = lazy(() => import('@pages/admin/PlantillasLista'));
const PlantillaForm         = lazy(() => import('@pages/admin/PlantillaForm'));
const UsuariosLista         = lazy(() => import('@pages/admin/UsuariosLista'));
const UsuarioForm           = lazy(() => import('@pages/admin/UsuarioForm'));
const UsuariosExternosLista = lazy(() => import('@pages/admin/UsuariosExternosLista'));
const UsuarioExternoForm    = lazy(() => import('@pages/admin/UsuarioExternoForm'));
const Perfil                = lazy(() => import('@pages/Perfil'));
const Notificaciones        = lazy(() => import('@pages/Notificaciones'));
const Reportes              = lazy(() => import('@pages/Reportes'));

// ── Full-screen loader for Suspense fallback ──────────────────────────────────
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-surface">
    <Spinner size="lg" />
  </div>
);

// ── Routes ────────────────────────────────────────────────────────────────────
const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ResetPassword />} />

      <Route element={<PrivateRoute />}>
        <Route
          path="/change-password"
          element={
            <AuthLayout
              title="Cambiar Contraseña"
              subtitle="Debés actualizar tu contraseña para continuar."
            >
              <ChangePassword />
            </AuthLayout>
          }
        />

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard"        element={<Dashboard />} />
          <Route path="/perfil"           element={<Perfil />} />
          <Route path="/notificaciones"   element={<Notificaciones />} />
          <Route path="/reportes"         element={<Reportes />} />

          {/* Trámites — todos los roles */}
          <Route path="/tramites"            element={<TramitesLista />} />
          <Route path="/tramites/nuevo"      element={<TramiteCrear />} />
          <Route path="/tramites/:id"        element={<TramiteDetalle />} />
          <Route path="/tramites/:id/editar" element={<TramiteEditar />} />

          {/* Director */}
          <Route element={<RoleRoute allowedRoles={['director', 'admin']} />}>
            <Route path="/director"          element={<BandejaDirector />} />
            <Route path="/tramites-empresa"  element={<TramitesEmpresa />} />
            <Route path="/mis-usuarios"      element={<UsuariosEmpresa />} />
            <Route path="/mis-oficinas"              element={<OficinasEmpresaLista />} />
            <Route path="/mis-oficinas/nueva"        element={<OficinaEmpresaForm />} />
            <Route path="/mis-oficinas/:id/editar"   element={<OficinaEmpresaForm />} />
          </Route>

          {/* Moderador */}
          <Route element={<RoleRoute allowedRoles={['moderador', 'admin']} />}>
            <Route path="/asignacion"                    element={<BandejaAsignacion />} />
            <Route path="/moderador/asignar/:tramite_id" element={<AsignarTramite />} />
          </Route>

          {/* Revisores */}
          <Route element={<RoleRoute allowedRoles={['jefe_oficina', 'interno', 'admin']} />}>
            <Route path="/revisiones"              element={<MisRevisiones />} />
            <Route path="/revisiones/:tramite_id"  element={<RevisarTramite />} />
          </Route>

          {/* Decisor */}
          <Route element={<RoleRoute allowedRoles={['jefe_oficina', 'admin']} />}>
            <Route path="/decision"              element={<BandejaFinal />} />
            <Route path="/decision/:tramite_id"  element={<TomarDecision />} />
          </Route>

          {/* Admin — Empresas */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/empresas"              element={<EmpresasLista />} />
            <Route path="/empresas/nueva"        element={<EmpresaForm />} />
            <Route path="/empresas/:id/editar"   element={<EmpresaForm />} />
          </Route>

          {/* Admin — Oficinas */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/oficinas"              element={<OficinasLista />} />
            <Route path="/oficinas/nueva"        element={<OficinaForm />} />
            <Route path="/oficinas/:id/editar"   element={<OficinaForm />} />
          </Route>

          {/* Admin — Usuarios Internos */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/usuarios"              element={<UsuariosLista />} />
            <Route path="/usuarios/nuevo"        element={<UsuarioForm />} />
            <Route path="/usuarios/:id/editar"   element={<UsuarioForm />} />
          </Route>

          {/* Admin — Tipos de Trámite */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/tipos-tramite"                    element={<TiposTramiteLista />} />
            <Route path="/tipos-tramite/nuevo"              element={<TipoTramiteNuevoForm />} />
            <Route path="/tipos-tramite/:id/configurar"     element={<TipoTramiteBuilder />} />
          </Route>

          {/* Admin — Plantillas de Mensaje */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/plantillas"              element={<PlantillasLista />} />
            <Route path="/plantillas/nueva"        element={<PlantillaForm />} />
            <Route path="/plantillas/:id/editar"   element={<PlantillaForm />} />
          </Route>

          {/* Admin — Usuarios Externos */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/usuarios-externos"              element={<UsuariosExternosLista />} />
            <Route path="/usuarios-externos/nuevo"        element={<UsuarioExternoForm />} />
            <Route path="/usuarios-externos/:id/editar"   element={<UsuarioExternoForm />} />
          </Route>
        </Route>
      </Route>

      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
