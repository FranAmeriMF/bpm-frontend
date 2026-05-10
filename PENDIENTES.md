# Pendientes — Sistema de Gestión de Trámites

> Última actualización: 2026-05-10

---

## ✅ Implementado

### Auth
- Login con JWT
- Recuperar contraseña (ForgotPassword + ResetPassword con token de 15 min)
- Cambiar contraseña al primer login (ChangePassword)
- Perfil / Mis datos (editar nombre, apellido, teléfono, cargo + cambiar contraseña)

### Trámites
- Lista con filtros por estado, búsqueda y paginación
- Detalle con tabs: datos, secciones, archivos, historial completo (fechas, roles, comentarios)
- Crear trámite (formulario dinámico por tipo, con solicitante_id)
- Editar trámite (estado borrador / corrigiendo)

### Director de Empresa
- Bandeja de revisión interna
- Ver todos los trámites de la empresa (TramitesEmpresa)
- Gestionar usuarios de la empresa — ver, activar/desactivar, resetear contraseña
- Gestionar oficinas de la empresa — CRUD completo + asignar/desasignar usuarios

### Moderador
- Bandeja de asignación (trámites pendiente_asignacion)
- Asignar trámite a oficinas y jefe

### Revisiones (jefe_oficina / interno)
- Mis revisiones
- Revisar trámite — completar secciones con estado y comentario

### Decisor (jefe_oficina)
- Bandeja final (trámites en_revision_final)
- Tomar decisión final con mensaje al solicitante

### Admin
- CRUD completo: Empresas, Oficinas municipales, Tipos de Trámite, Plantillas, Usuarios Internos, Usuarios Externos
- Builder de campos dinámicos por tipo de trámite

### Dashboard
- Métricas por rol (stat cards con conteo por estado)
- Gráfico de torta (recharts) — visible para solicitante, admin, moderador
- Últimos trámites recientes

### Notificaciones
- Panel en Navbar con polling cada 30 s
- Marcar leída / marcar todas leídas

### Backend
- Email de bienvenida (cuenta nueva) y reset por admin
- Email de recuperación de contraseña con link a frontend
- Upload y descarga de archivos (PDF, JPG, PNG, DOCX — máx. 10 MB)

---

## ❌ Pendiente

### 1. Upload de archivos en el frontend
El backend ya tiene POST /archivos/upload/:tramite_id implementado y archivosApi.js
ya expone uploadArchivo y useDeleteArchivoMutation, pero ninguna página los usa todavía.

- [ ] TramiteCrear.jsx — agregar sección de adjuntar archivos antes de enviar
- [ ] TramiteEditar.jsx — idem, más eliminar archivos existentes
- [ ] RevisarTramite.jsx — permitir subir archivos de evidencia por sección
- [ ] Componente FileUpload reutilizable con barra de progreso (onUploadProgress)

### 2. URLs hardcodeadas en el backend
Los emails usan http://localhost:5173 directamente en el código.

- [ ] backend/src/auth/auth.service.ts — URL del link de reset password
- [ ] backend/src/mail/mail.service.ts — links "Ir al sistema" en bienvenida/reset admin
- [ ] Mover a variable de entorno FRONTEND_URL en .env

### 3. Botón "Configuración" en Navbar sin acción
El ítem Configuración del menú de usuario no tiene onClick ni link.

- [ ] Enlazar a /perfil o eliminar el ítem

### 4. Variables de entorno para producción
- [ ] Crear .env.example para backend con todas las variables necesarias
- [ ] Crear .env.example para frontend
- [ ] Documentar pasos de deploy (build, migraciones, seed en prod)

### 5. Testing
- [ ] Tests unitarios de componentes clave (React Testing Library)
- [ ] Tests de integración de endpoints críticos (auth, tramites, archivos)

### 6. Deployment / CI-CD
- [ ] Build de producción (npm run build)
- [ ] Configurar servidor (PM2, Docker, etc.)
- [ ] Pipeline de CI (GitHub Actions o similar)