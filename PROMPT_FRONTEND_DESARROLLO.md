# PROMPT PARA DESARROLLO FRONTEND
## Sistema de Gestión de Trámites Municipales - React + Vite

---

## CONTEXTO DEL PROYECTO

Estás desarrollando el **frontend de un sistema de gestión de trámites municipales** usando **React 18+ con Vite**. El sistema permite a empresas crear trámites, a oficinas técnicas evaluar sección por sección, y a jefes decisores tomar decisiones finales fundamentadas.

El proyecto implementa el design system **"The Civic Architect"** que se basa en el concepto de **"The Transparent Monolith"**: una experiencia digital autoritativa pero clara, usando **Tonal Layering** e **Intentional Asymmetry** en lugar de líneas rígidas.

---

## STACK TECNOLÓGICO

```json
{
  "framework": "React 18.2+",
  "buildTool": "Vite 4.3+",
  "routing": "React Router v6",
  "stateManagement": "Redux Toolkit + RTK Query",
  "styling": "Tailwind CSS 3.3+",
  "uiComponents": "Headless UI + Custom Components",
  "forms": "React Hook Form + Yup",
  "httpClient": "Axios",
  "dateHandling": "date-fns",
  "notifications": "react-toastify",
  "charts": "recharts"
}
```

---

## ESTRUCTURA DE PROYECTO

```
frontend/
├── public/
│   ├── favicon.ico
│   └── logo.png
├── src/
│   ├── assets/
│   │   ├── fonts/
│   │   │   └── Manrope/         # Font files
│   │   └── images/
│   ├── config/
│   │   ├── theme.js             # Design system tokens
│   │   └── constants.js
│   ├── api/
│   │   ├── client.js            # Axios instance
│   │   ├── auth.api.js
│   │   ├── tramites.api.js
│   │   ├── empresas.api.js
│   │   ├── evaluaciones.api.js
│   │   └── decisiones.api.js
│   ├── components/
│   │   ├── atoms/               # Design system primitives
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── StatusPill.jsx
│   │   │   ├── Card.jsx
│   │   │   └── ...
│   │   ├── molecules/
│   │   │   ├── FormField.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── FilterDropdown.jsx
│   │   │   └── ...
│   │   ├── organisms/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── TramiteCard.jsx
│   │   │   ├── EvaluacionSeccion.jsx
│   │   │   └── ...
│   │   ├── templates/
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── AuthLayout.jsx
│   │   │   └── ...
│   │   └── features/            # Feature-specific components
│   │       ├── tramites/
│   │       ├── evaluaciones/
│   │       └── decisiones/
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useTramite.js
│   │   ├── useNotifications.js
│   │   └── useDebounce.js
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── dashboard/
│   │   │   └── Dashboard.jsx
│   │   ├── tramites/
│   │   │   ├── TramitesLista.jsx
│   │   │   ├── TramiteDetalle.jsx
│   │   │   ├── TramiteCrear.jsx
│   │   │   └── TramiteEditar.jsx
│   │   ├── revision/
│   │   │   ├── MisTramites.jsx
│   │   │   └── RevisarTramite.jsx
│   │   └── decision/
│   │       ├── BandejaFinal.jsx
│   │       ├── AnalizarTramite.jsx
│   │       ├── TomarDecision.jsx
│   │       └── HistorialDecisiones.jsx
│   ├── routes/
│   │   ├── AppRoutes.jsx
│   │   ├── PrivateRoute.jsx
│   │   └── RoleRoute.jsx
│   ├── store/
│   │   ├── index.js
│   │   ├── slices/
│   │   │   ├── authSlice.js
│   │   │   ├── tramitesSlice.js
│   │   │   ├── evaluacionesSlice.js
│   │   │   └── notificacionesSlice.js
│   │   └── api/
│   │       ├── tramitesApi.js   # RTK Query
│   │       └── evaluacionesApi.js
│   ├── utils/
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   ├── helpers.js
│   │   └── constants.js
│   ├── styles/
│   │   ├── globals.css
│   │   └── tailwind.css
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## CONFIGURACIÓN INICIAL

### 1. Instalación y Setup

```bash
# Crear proyecto Vite con React
npm create vite@latest frontend -- --template react
cd frontend

# Instalar dependencias principales
npm install react-router-dom @reduxjs/toolkit react-redux axios
npm install react-hook-form yup @hookform/resolvers
npm install date-fns react-toastify recharts

# Instalar Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Instalar Headless UI
npm install @headlessui/react @heroicons/react

# Instalar dev dependencies
npm install -D eslint prettier eslint-config-prettier
```

### 2. Configuración de Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@api': path.resolve(__dirname, './src/api'),
      '@store': path.resolve(__dirname, './src/store'),
      '@assets': path.resolve(__dirname, './src/assets')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3005',
        changeOrigin: true
      }
    }
  }
});
```

### 3. Configuración de Tailwind CSS con Design System

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design System: The Civic Architect
        primary: {
          DEFAULT: '#005c9b',
          container: '#2e75b6',
          fixed: '#cce4ff',
          'fixed-dim': '#99ceff',
          tint: '#70b4ff'
        },
        secondary: {
          DEFAULT: '#525e71',
          container: '#d6e3f8',
          fixed: '#d6e3f8',
          'fixed-dim': '#bad1ec'
        },
        tertiary: {
          DEFAULT: '#6a5778',
          container: '#f2daff',
          fixed: '#f2daff',
          'fixed-dim': '#d5bef7'
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6'
        },
        surface: {
          DEFAULT: '#f8f9ff',
          dim: '#d9d9e3',
          bright: '#f8f9ff',
          'container-lowest': '#ffffff',
          'container-low': '#f2f3f9',
          'container': '#ecedfa',
          'container-high': '#e7e8f5',
          'container-highest': '#e1e2ef',
          tint: '#005c9b'
        },
        on: {
          primary: '#ffffff',
          'primary-container': '#001d32',
          secondary: '#ffffff',
          'secondary-container': '#0f1c2c',
          tertiary: '#ffffff',
          'tertiary-container': '#250f32',
          error: '#ffffff',
          'error-container': '#410002',
          surface: '#191c20',
          'surface-variant': '#414750',
          'tertiary-fixed': '#3b0050',
          'tertiary-fixed-variant': '#50395f'
        },
        outline: {
          DEFAULT: '#72777f',
          variant: '#c1c7d2'
        },
        shadow: '#191c20',
        'surface-tint': '#005c9b',
        'inverse-surface': '#2f3135',
        'inverse-on-surface': '#f0f0f7',
        'inverse-primary': '#99ceff'
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Display
        'display-lg': ['57px', { lineHeight: '64px', letterSpacing: '-0.02em', fontWeight: '400' }],
        'display-md': ['45px', { lineHeight: '52px', letterSpacing: '-0.02em', fontWeight: '400' }],
        'display-sm': ['36px', { lineHeight: '44px', letterSpacing: '0', fontWeight: '400' }],
        // Headline
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '0', fontWeight: '400' }],
        'headline-md': ['28px', { lineHeight: '36px', letterSpacing: '0', fontWeight: '400' }],
        'headline-sm': ['24px', { lineHeight: '32px', letterSpacing: '0', fontWeight: '400' }],
        // Title
        'title-lg': ['22px', { lineHeight: '28px', letterSpacing: '0', fontWeight: '500' }],
        'title-md': ['16px', { lineHeight: '24px', letterSpacing: '0.15px', fontWeight: '500' }],
        'title-sm': ['14px', { lineHeight: '20px', letterSpacing: '0.1px', fontWeight: '500' }],
        // Body
        'body-lg': ['16px', { lineHeight: '24px', letterSpacing: '0.5px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', letterSpacing: '0.25px', fontWeight: '400' }],
        'body-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.4px', fontWeight: '400' }],
        // Label
        'label-lg': ['14px', { lineHeight: '20px', letterSpacing: '0.1px', fontWeight: '500' }],
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.5px', fontWeight: '500' }],
        'label-sm': ['11px', { lineHeight: '16px', letterSpacing: '0.5px', fontWeight: '500' }],
      },
      borderRadius: {
        'none': '0',
        'xs': '2px',
        'sm': '4px',
        DEFAULT: '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '28px',
        'full': '9999px',
      },
      spacing: {
        '0': '0',
        '1': '0.25rem',  // 4px
        '2': '0.5rem',   // 8px
        '3': '0.75rem',  // 12px
        '4': '1rem',     // 16px
        '5': '1.25rem',  // 20px
        '6': '1.5rem',   // 24px
        '8': '2rem',     // 32px
        '10': '2.5rem',  // 40px
        '12': '3rem',    // 48px
        '16': '4rem',    // 64px
      },
      boxShadow: {
        // Ambient shadows (Design System)
        'ambient': '0px 12px 32px rgba(25, 28, 32, 0.06)',
        'ambient-lg': '0px 16px 40px rgba(25, 28, 32, 0.08)',
        'ambient-sm': '0px 8px 24px rgba(25, 28, 32, 0.04)',
      },
      backdropBlur: {
        'glass': '24px',
      },
    },
  },
  plugins: [],
}
```

### 4. Variables de Entorno

```bash
# .env.example
VITE_API_URL=http://localhost:3005/api
VITE_APP_NAME=Sistema de Trámites
```

---

## IMPLEMENTACIÓN DEL DESIGN SYSTEM

### 1. Componentes Atómicos (Atoms)

#### Button Component

```jsx
// src/components/atoms/Button.jsx
import { forwardRef } from 'react';
import { cn } from '@/utils/helpers';

const variants = {
  primary: 'bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-ambient hover:shadow-ambient-lg transition-shadow',
  secondary: 'bg-surface-container-highest text-primary hover:bg-surface-container-high transition-colors',
  tertiary: 'bg-transparent text-primary hover:bg-surface-container-low transition-colors',
  error: 'bg-error text-on-error hover:bg-error/90 transition-colors',
};

const sizes = {
  sm: 'px-4 py-2 text-label-sm',
  md: 'px-6 py-3 text-label-md',
  lg: 'px-8 py-4 text-label-lg',
};

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className,
  disabled,
  ...props 
}, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        'rounded-DEFAULT font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
```

#### Input Component

```jsx
// src/components/atoms/Input.jsx
import { forwardRef } from 'react';
import { cn } from '@/utils/helpers';

const Input = forwardRef(({ 
  label,
  error,
  helperText,
  className,
  ...props 
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-label-md text-on-surface-variant">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-3 rounded-sm',
          'bg-surface-container-lowest text-on-surface text-body-md',
          'transition-all duration-200',
          // Focus state: Ghost Border (2px primary at 40% opacity)
          'focus:outline-none focus:ring-2 focus:ring-primary/40',
          // Error state
          error ? 'bg-error-container/10 ring-2 ring-error/40 text-error' : '',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-label-sm text-on-error-container bg-error-container/10 px-3 py-1 rounded-sm">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-label-sm text-on-surface-variant">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
```

#### StatusPill Component (Signature Component)

```jsx
// src/components/atoms/StatusPill.jsx
import { cn } from '@/utils/helpers';

const statusConfig = {
  // Estados de trámite
  borrador: { 
    bg: 'bg-surface-container-high', 
    text: 'text-on-surface-variant',
    label: 'Borrador'
  },
  en_revision_interna: { 
    bg: 'bg-secondary-container', 
    text: 'text-on-secondary-container',
    label: 'Revisión Interna'
  },
  pendiente_asignacion: { 
    bg: 'bg-tertiary-container/10', 
    text: 'text-tertiary',
    label: 'Pendiente Asignación'
  },
  asignado: { 
    bg: 'bg-primary-fixed', 
    text: 'text-on-primary-container',
    label: 'Asignado'
  },
  en_revision: { 
    bg: 'bg-secondary-fixed', 
    text: 'text-on-secondary-container',
    label: 'En Revisión'
  },
  en_revision_final: { 
    bg: 'bg-tertiary-fixed', 
    text: 'text-on-tertiary-fixed',
    label: 'Decisión Pendiente'
  },
  aprobado: { 
    bg: 'bg-tertiary-fixed', 
    text: 'text-on-tertiary-fixed',
    label: 'Aprobado'
  },
  rechazado: { 
    bg: 'bg-error-container', 
    text: 'text-on-error-container',
    label: 'Rechazado'
  },
  observado: { 
    bg: 'bg-tertiary-container/10', 
    text: 'text-tertiary',
    label: 'Observado'
  },
  corrigiendo: { 
    bg: 'bg-secondary-container', 
    text: 'text-on-secondary-container',
    label: 'Corrigiendo'
  },
};

const StatusPill = ({ status, className }) => {
  const config = statusConfig[status] || statusConfig.borrador;
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-label-md font-medium',
        config.bg,
        config.text,
        className
      )}
    >
      {config.label}
    </span>
  );
};

export default StatusPill;
```

#### Card Component

```jsx
// src/components/atoms/Card.jsx
import { cn } from '@/utils/helpers';

const Card = ({ 
  children, 
  className,
  elevated = false,
  onClick,
  ...props 
}) => {
  return (
    <div
      className={cn(
        'rounded-DEFAULT overflow-hidden transition-all duration-200',
        // Tonal Layering (no borders)
        'bg-surface-container-low',
        // Elevation
        elevated ? 'shadow-ambient hover:shadow-ambient-lg' : '',
        // Interactive
        onClick ? 'cursor-pointer hover:bg-surface-container' : '',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
```

### 2. Componentes Moleculares (Molecules)

#### FormField Component

```jsx
// src/components/molecules/FormField.jsx
import { useFormContext, Controller } from 'react-hook-form';
import Input from '@/components/atoms/Input';

const FormField = ({ 
  name, 
  label, 
  type = 'text',
  placeholder,
  helperText,
  ...props 
}) => {
  const { control, formState: { errors } } = useFormContext();
  
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Input
          {...field}
          label={label}
          type={type}
          placeholder={placeholder}
          helperText={helperText}
          error={errors[name]?.message}
          {...props}
        />
      )}
    />
  );
};

export default FormField;
```

#### SearchBar Component

```jsx
// src/components/molecules/SearchBar.jsx
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const SearchBar = ({ placeholder = 'Buscar...', value, onChange }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-on-surface-variant" />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3 rounded-DEFAULT bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
      />
    </div>
  );
};

export default SearchBar;
```

### 3. Componentes Organizacionales (Organisms)

#### Navbar Component

```jsx
// src/components/organisms/Navbar.jsx
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { 
  BellIcon, 
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  
  return (
    <nav className="bg-surface-container-low/80 backdrop-blur-glass border-b border-outline-variant/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <h1 className="text-title-lg text-primary font-semibold">
              Sistema de Trámites
            </h1>
          </div>
          
          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 rounded-DEFAULT hover:bg-surface-container transition-colors">
              <BellIcon className="h-6 w-6 text-on-surface-variant" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-5 w-5 bg-error text-on-error text-label-sm flex items-center justify-center rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {/* User menu */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-3 p-2 rounded-DEFAULT hover:bg-surface-container transition-colors">
                <UserCircleIcon className="h-8 w-8 text-on-surface-variant" />
                <div className="text-left">
                  <p className="text-body-md text-on-surface font-medium">
                    {user?.nombre} {user?.apellido}
                  </p>
                  <p className="text-label-sm text-on-surface-variant capitalize">
                    {user?.rol?.replace('_', ' ')}
                  </p>
                </div>
              </Menu.Button>
              
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-56 bg-surface-container-low rounded-DEFAULT shadow-ambient focus:outline-none">
                  <div className="p-2 space-y-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active ? 'bg-surface-container' : ''
                          } group flex items-center w-full px-4 py-2 text-body-md text-on-surface rounded-sm transition-colors`}
                        >
                          <Cog6ToothIcon className="h-5 w-5 mr-3 text-on-surface-variant" />
                          Configuración
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={logout}
                          className={`${
                            active ? 'bg-error-container' : ''
                          } group flex items-center w-full px-4 py-2 text-body-md text-error rounded-sm transition-colors`}
                        >
                          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                          Cerrar Sesión
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
```

#### TramiteCard Component

```jsx
// src/components/organisms/TramiteCard.jsx
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  BuildingOfficeIcon, 
  UserIcon,
  CalendarIcon 
} from '@heroicons/react/24/outline';
import Card from '@/components/atoms/Card';
import StatusPill from '@/components/atoms/StatusPill';

const TramiteCard = ({ tramite, onClick }) => {
  return (
    <Card 
      onClick={() => onClick(tramite.id)}
      elevated
    >
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-title-lg text-on-surface font-medium">
              Trámite #{tramite.numero}
            </h3>
            <p className="text-body-md text-on-surface-variant mt-1">
              {tramite.tipo_tramite.nombre}
            </p>
          </div>
          <StatusPill status={tramite.estado} />
        </div>
        
        {/* Metadata */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3 text-body-sm text-on-surface-variant">
            <BuildingOfficeIcon className="h-5 w-5" />
            <span>{tramite.empresa.razon_social}</span>
          </div>
          <div className="flex items-center space-x-3 text-body-sm text-on-surface-variant">
            <UserIcon className="h-5 w-5" />
            <span>{tramite.solicitante.nombre} {tramite.solicitante.apellido}</span>
          </div>
          <div className="flex items-center space-x-3 text-body-sm text-on-surface-variant">
            <CalendarIcon className="h-5 w-5" />
            <span>
              {format(new Date(tramite.fecha_creacion), "d 'de' MMMM, yyyy", { locale: es })}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TramiteCard;
```

---

## PÁGINAS PRINCIPALES

### Login Page

```jsx
// src/pages/auth/Login.jsx
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import { useAuth } from '@/hooks/useAuth';

const schema = yup.object({
  email: yup.string().email('Email inválido').required('Email requerido'),
  password: yup.string().required('Contraseña requerida')
});

const Login = () => {
  const methods = useForm({
    resolver: yupResolver(schema)
  });
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const onSubmit = async (data) => {
    try {
      await login(data);
      toast.success('¡Bienvenido!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  };
  
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      {/* Glassmorphism container */}
      <div className="w-full max-w-md bg-surface-container-low/80 backdrop-blur-glass rounded-DEFAULT shadow-ambient-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-display-sm text-primary font-semibold mb-2">
            Sistema de Trámites
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Ingresa tus credenciales para continuar
          </p>
        </div>
        
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="email"
              label="Correo electrónico"
              type="email"
              placeholder="tu@email.com"
            />
            
            <FormField
              name="password"
              label="Contraseña"
              type="password"
              placeholder="••••••••"
            />
            
            <Button 
              type="submit" 
              variant="primary" 
              size="lg"
              className="w-full"
              disabled={methods.formState.isSubmitting}
            >
              {methods.formState.isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default Login;
```

### Dashboard Page

```jsx
// src/pages/dashboard/Dashboard.jsx
import { useAuth } from '@/hooks/useAuth';
import { useGetTramitesQuery } from '@/store/api/tramitesApi';
import Card from '@/components/atoms/Card';
import TramiteCard from '@/components/organisms/TramiteCard';

const Dashboard = () => {
  const { user } = useAuth();
  const { data, isLoading } = useGetTramitesQuery();
  
  // Estadísticas según rol
  const stats = [
    { label: 'Trámites Totales', value: data?.total || 0, color: 'bg-primary-fixed' },
    { label: 'En Revisión', value: data?.enRevision || 0, color: 'bg-secondary-fixed' },
    { label: 'Pendientes', value: data?.pendientes || 0, color: 'bg-tertiary-fixed' },
  ];
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-display-sm text-on-surface font-medium">
          Bienvenido, {user?.nombre}
        </h1>
        <p className="text-body-lg text-on-surface-variant mt-2">
          Panel de control - {user?.rol?.replace('_', ' ')}
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} elevated>
            <div className={`p-6 ${stat.color} rounded-DEFAULT`}>
              <p className="text-label-lg text-on-surface-variant mb-2">
                {stat.label}
              </p>
              <p className="text-display-md text-on-surface font-semibold">
                {stat.value}
              </p>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Recent Tramites */}
      <div>
        <h2 className="text-headline-sm text-on-surface font-medium mb-4">
          Trámites Recientes
        </h2>
        <div className="space-y-4">
          {isLoading ? (
            <p>Cargando...</p>
          ) : (
            data?.tramites?.slice(0, 5).map((tramite) => (
              <TramiteCard key={tramite.id} tramite={tramite} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
```

---

## INTEGRACIÓN CON BACKEND

### Axios Client

```javascript
// src/api/client.js
import axios from 'axios';
import { store } from '@/store';
import { logout } from '@/store/slices/authSlice';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
client.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
```

### RTK Query API

```javascript
// src/store/api/tramitesApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const tramitesApi = createApi({
  reducerPath: 'tramitesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ['Tramite', 'Evaluacion', 'Decision'],
  endpoints: (builder) => ({
    getTramites: builder.query({
      query: (params) => ({ url: '/tramites', params }),
      providesTags: ['Tramite']
    }),
    getTramite: builder.query({
      query: (id) => `/tramites/${id}`,
      providesTags: (result, error, id) => [{ type: 'Tramite', id }]
    }),
    createTramite: builder.mutation({
      query: (tramite) => ({
        url: '/tramites',
        method: 'POST',
        body: tramite
      }),
      invalidatesTags: ['Tramite']
    }),
    // ... más endpoints
  })
});

export const {
  useGetTramitesQuery,
  useGetTramiteQuery,
  useCreateTramiteMutation
} = tramitesApi;
```

### Utility Helpers

```javascript
// src/utils/helpers.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Función para combinar clases de Tailwind
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Formatear fecha
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Formatear moneda
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(amount);
};
```

---

## INSTRUCCIONES DE DESARROLLO

### Principios del Design System "The Civic Architect"

1. ✅ **NO usar bordes de 1px** - Usa Tonal Layering con backgrounds
2. ✅ **Usar roundness DEFAULT (8px)** para todo excepto pills (full)
3. ✅ **Gradientes para CTAs primarios** (primary → primary-container a 135°)
4. ✅ **Glassmorphism** para modales/overlays (80% opacity + 24px blur)
5. ✅ **Sombras ambient** en lugar de drop shadows tradicionales
6. ✅ **Ghost borders** solo si es necesario (outline-variant a 20% opacity)
7. ✅ **Spacing de 16px** (spacing-4) entre elementos en lugar de líneas divisoras
8. ✅ **Manrope** con letter-spacing de -0.02em para display
9. ✅ **on-surface (#191c20)** para texto, NUNCA negro puro
10. ✅ **Máximo 3 niveles** de surface depth

### Checklist de Implementación

#### Fase 1: Setup Inicial
- [ ] Crear proyecto con Vite
- [ ] Instalar dependencias (React Router, Redux, Tailwind, etc.)
- [ ] Configurar Tailwind con design system tokens
- [ ] Configurar alias de paths en Vite
- [ ] Crear estructura de carpetas
- [ ] Configurar variables de entorno

#### Fase 2: Design System
- [ ] Implementar Button component
- [ ] Implementar Input component
- [ ] Implementar StatusPill component
- [ ] Implementar Card component
- [ ] Implementar FormField component
- [ ] Implementar SearchBar component
- [ ] Implementar Navbar component
- [ ] Implementar Sidebar component
- [ ] Implementar TramiteCard component

#### Fase 3: Routing y Auth
- [ ] Configurar React Router v6
- [ ] Crear PrivateRoute guard
- [ ] Crear RoleRoute guard
- [ ] Implementar Login page
- [ ] Configurar Redux Toolkit
- [ ] Implementar authSlice
- [ ] Crear useAuth hook
- [ ] Integrar autenticación con backend

#### Fase 4: Páginas Principales
- [ ] Implementar Dashboard según rol
- [ ] Implementar TramitesLista page
- [ ] Implementar TramiteDetalle page
- [ ] Implementar TramiteCrear page
- [ ] Implementar RevisarTramite page (Módulo 7)
- [ ] Implementar BandejaFinal page (Módulo 8)
- [ ] Implementar TomarDecision page (Módulo 8)

#### Fase 5: Integración Backend
- [ ] Configurar Axios client
- [ ] Implementar interceptors (JWT, 401)
- [ ] Configurar RTK Query
- [ ] Crear tramitesApi
- [ ] Crear evaluacionesApi
- [ ] Crear decisionesApi
- [ ] Implementar hooks personalizados

#### Fase 6: Features Avanzadas
- [ ] Sistema de notificaciones (react-toastify)
- [ ] Upload de archivos (Multer)
- [ ] Gráficos y estadísticas (recharts)
- [ ] Filtros y búsqueda avanzada
- [ ] Paginación de listas
- [ ] Loading states y skeletons

#### Fase 7: Testing y Optimización
- [ ] Testing de componentes (React Testing Library)
- [ ] Optimización de performance (React.memo, useMemo)
- [ ] Code splitting (lazy loading)
- [ ] SEO y meta tags
- [ ] PWA configuration (opcional)

#### Fase 8: Deployment
- [ ] Build de producción (`npm run build`)
- [ ] Configurar variables de entorno de producción
- [ ] Deploy a hosting (Vercel, Netlify, etc.)
- [ ] Configurar CI/CD (GitHub Actions)

---

## COMANDOS DE DESARROLLO

```bash
# Desarrollo local
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Lint
npm run lint

# Format
npm run format

# Tests
npm run test
```

---

## ESTRUCTURA DE MAIN FILES

### main.jsx

```jsx
// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import App from './App';
import { store } from './store';
import './styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <ToastContainer
        position="top-right"
        autoClose={3005}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </Provider>
  </React.StrictMode>
);
```

### App.jsx

```jsx
// src/App.jsx
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
```

### globals.css

```css
/* src/styles/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-outline-variant/20;
  }
  
  body {
    @apply bg-surface text-on-surface font-sans antialiased;
  }
  
  /* Scrollbar personalizado */
  ::-webkit-scrollbar {
    @apply w-2 h-2;
  }
  
  ::-webkit-scrollbar-track {
    @apply bg-surface-container-low;
  }
  
  ::-webkit-scrollbar-thumb {
    @apply bg-outline-variant rounded-full;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    @apply bg-outline;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

---

## NOTAS FINALES

### Reglas Importantes

1. **SIEMPRE** usa el sistema de colores del design system, nunca colores arbitrarios
2. **SIEMPRE** usa los tamaños de tipografía definidos (`text-display-lg`, `text-body-md`, etc.)
3. **NUNCA** uses bordes sólidos de 1px, usa Tonal Layering
4. **SIEMPRE** usa `rounded-DEFAULT` (8px) excepto para pills (`rounded-full`)
5. **SIEMPRE** usa spacing-4 (16px) entre elementos en lugar de líneas divisoras
6. **SIEMPRE** usa `shadow-ambient` en lugar de sombras por defecto
7. **SIEMPRE** usa `on-surface` (#191c20) para texto, no negro puro
8. **NUNCA** anides más de 3 niveles de surface

### Recursos Adicionales

- **Design System:** The Civic Architect
- **Iconos:** Heroicons (ya incluidos con Headless UI)
- **Fuente:** Manrope (Google Fonts)
- **Documentación Tailwind:** https://tailwindcss.com
- **Documentación React Router:** https://reactrouter.com
- **Documentación Redux Toolkit:** https://redux-toolkit.js.org

---

**Este prompt completo te proporciona TODO lo necesario para desarrollar el frontend del Sistema de Gestión de Trámites Municipales siguiendo el design system "The Civic Architect". Sigue las instrucciones paso a paso y mantén los principios del design system en cada línea de código.**

**¡Éxito en el desarrollo! 🚀**
