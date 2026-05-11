# Frontend — Sistema de Trámites

Aplicación SPA construida con React + Vite que consume la API REST del backend NestJS.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | React 18 |
| Build tool | Vite 5 |
| Routing | React Router v6 |
| Estado / Data fetching | Redux Toolkit + RTK Query |
| Formularios | React Hook Form + Yup |
| Estilos | Tailwind CSS v3 (tokens Material Design 3) |
| Componentes UI | Headless UI + Heroicons |
| Gráficos | Recharts |
| Notificaciones | React Toastify |

---

## Requisitos previos

- Node.js 22+
- Backend corriendo en `http://localhost:3005`

---

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Levantar servidor de desarrollo (puerto 5173)
npm run dev
```

El servidor de desarrollo proxea automáticamente `/api/*` → `http://localhost:3005` (configurado en `vite.config.js`).

---

## Build de producción

```bash
npm run build      # genera /dist
npm run preview    # sirve /dist localmente para verificar
```

---

## Docker

```bash
# Build de la imagen
docker build -t tramites-frontend .

# Levantar con el compose del proyecto (recomendado)
cd ..
docker compose up --build -d
```

La imagen de producción usa **nginx** para servir los estáticos y proxear `/api` al servicio `backend`.

---

## Variables de entorno

En desarrollo no se necesita ningún `.env` — la URL de la API está configurada en `vite.config.js` vía el proxy de Vite.

En producción (Docker) el proxy lo hace nginx, por lo que tampoco se requieren variables de entorno en la imagen.

---

## Estructura del proyecto

```
src/
├── api/                  # Endpoints RTK Query (un archivo por recurso)
│   ├── baseApi.js        # Configuración base + manejo de 401
│   ├── tramitesApi.js
│   ├── empresasApi.js
│   └── ...
├── components/
│   ├── atoms/            # Button, Card, Spinner, StatusPill, DateInput, ...
│   ├── molecules/        # SearchBar, FilterDropdown, Tabs, Pagination, ...
│   └── organisms/        # Navbar, Sidebar, TramiteFormSections, HistorialTramite, ...
├── hooks/
│   ├── useAuth.js        # Acceso al usuario autenticado
│   └── useTheme.js       # Toggle dark/light mode
├── pages/
│   ├── tramites/         # TramitesLista, TramiteDetalle, TramiteCrear, TramiteEditar
│   ├── revisiones/       # MisRevisiones, RevisarTramite
│   ├── decisor/          # BandejaFinal, TomarDecision
│   ├── director/         # BandejaDirector
│   ├── moderador/        # BandejaAsignacion, AsignarTramite
│   └── admin/            # Empresas, Usuarios, Oficinas, TiposTramite, Plantillas
├── routes/
│   └── AppRoutes.jsx     # Definición de rutas + lazy loading
├── store/
│   └── authSlice.js      # Estado de autenticación (JWT + usuario)
├── styles/
│   └── globals.css       # Tokens de color MD3 (variables CSS en :root y .dark)
└── utils/
    └── helpers.js        # formatDate, cn(), TRAMITE_ESTADO_LABELS
```

---

## Roles y vistas

| Rol | Vistas principales |
|-----|--------------------|
| `solicitante` | Trámites (crear/editar/ver), Notificaciones, Perfil |
| `director` | Bandeja de Revisión, Trámites de empresa |
| `moderador` | Bandeja de Asignación, Reportes |
| `jefe_oficina` | Mis Revisiones, Revisar Trámite, Reportes |
| `admin` | Todo + gestión de Empresas, Usuarios, Oficinas, Tipos de Trámite |
| `decisor` | Bandeja Final, Tomar Decisión, Reportes |

---

## Dark mode

El tema se almacena en `localStorage` bajo la clave `theme` (`"light"` / `"dark"` / `"system"`).  
Un script bloqueante en `index.html` aplica la clase `.dark` antes del primer render para evitar flash.  
El toggle está en la barra de navegación (icono sol/luna).

---

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción en `/dist` |
| `npm run preview` | Sirve el build localmente |
| `npm run lint` | ESLint sobre todo el código |
| `npm run format` | Prettier sobre `/src` |
