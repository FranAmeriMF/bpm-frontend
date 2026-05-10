import { NavLink, Link } from 'react-router-dom';
import {
  HomeIcon,
  DocumentTextIcon,
  PlusIcon,
  InboxIcon,
  ClipboardDocumentCheckIcon,
  ScaleIcon,
  UsersIcon,
  BuildingOffice2Icon,
  BuildingOfficeIcon,
  ArrowsRightLeftIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  XMarkIcon,
  UserCircleIcon,
  MapPinIcon,
  FolderOpenIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@utils/helpers';

const NAV_ITEMS = {
  solicitante: [
    { label: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { label: 'Mis Trámites', path: '/tramites', icon: DocumentTextIcon },
    { label: 'Nuevo Trámite', path: '/tramites/nuevo', icon: PlusIcon },
  ],
  director: [
    { label: 'Dashboard',            path: '/dashboard',        icon: HomeIcon       },
    { label: 'Bandeja de Revisión',  path: '/director',         icon: InboxIcon      },
    { label: 'Trámites de Empresa',  path: '/tramites-empresa', icon: FolderOpenIcon },
    { label: 'Usuarios',             path: '/mis-usuarios',     icon: UsersIcon      },
    { label: 'Mis Oficinas',         path: '/mis-oficinas',     icon: MapPinIcon     },
  ],
  moderador: [
    { label: 'Dashboard',       path: '/dashboard',  icon: HomeIcon              },
    { label: 'Trámites',        path: '/tramites',   icon: DocumentTextIcon      },
    { label: 'Asignar Trámites', path: '/asignacion', icon: ArrowsRightLeftIcon  },
    { label: 'Reportes',        path: '/reportes',   icon: ChartBarIcon          },
  ],
  jefe_oficina: [
    { label: 'Dashboard',      path: '/dashboard',  icon: HomeIcon                  },
    { label: 'Mis Revisiones', path: '/revisiones', icon: ClipboardDocumentCheckIcon },
    { label: 'Bandeja Final',  path: '/decision',   icon: ScaleIcon                 },
    { label: 'Reportes',       path: '/reportes',   icon: ChartBarIcon              },
  ],
  interno: [
    { label: 'Dashboard',      path: '/dashboard',  icon: HomeIcon                  },
    { label: 'Mis Revisiones', path: '/revisiones', icon: ClipboardDocumentCheckIcon },
  ],
  admin: [
    { label: 'Dashboard',          path: '/dashboard',        icon: HomeIcon                 },
    { label: 'Trámites',           path: '/tramites',         icon: DocumentTextIcon         },
    { label: 'Reportes',           path: '/reportes',         icon: ChartBarIcon             },
    { label: 'Usuarios del Sistema', path: '/usuarios',       icon: UsersIcon                },
    { label: 'Usuarios Externos',  path: '/usuarios-externos', icon: UsersIcon               },
    { label: 'Empresas',           path: '/empresas',         icon: BuildingOffice2Icon      },
    { label: 'Oficinas',           path: '/oficinas',         icon: BuildingOfficeIcon       },
    { label: 'Tipos de Trámite',   path: '/tipos-tramite',    icon: ClipboardDocumentListIcon },
    { label: 'Plantillas',         path: '/plantillas',       icon: ChatBubbleLeftRightIcon  },
  ],
};

const Sidebar = ({ user, isOpen, onClose }) => {
  const links = NAV_ITEMS[user?.rol] ?? NAV_ITEMS.solicitante;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-shadow/40 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40',
          'w-64 flex-shrink-0 bg-surface-container-low',
          'flex flex-col h-full',
          'transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:shadow-none shadow-ambient-lg',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Close button (mobile only) */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-3 p-1.5 rounded hover:bg-surface-container transition-colors"
          aria-label="Cerrar menú"
        >
          <XMarkIcon className="h-5 w-5 text-on-surface-variant" />
        </button>

        {/* Logo area */}
        <div className="h-16 flex items-center px-5 flex-shrink-0 border-b border-outline-variant/20">
          <span className="text-title-sm text-on-surface-variant font-medium uppercase tracking-wider">
            Navegación
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {links.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded text-body-md font-medium transition-all duration-150',
                  isActive
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                )
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        {user && (
          <div className="border-t border-outline-variant/20 flex-shrink-0">
            <Link
              to="/perfil"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container transition-colors group"
            >
              <UserCircleIcon className="h-6 w-6 flex-shrink-0 text-on-surface-variant group-hover:text-on-surface" />
              <div className="min-w-0">
                <p className="text-body-sm text-on-surface font-medium truncate">
                  {user.nombre} {user.apellido}
                </p>
                <p className="text-label-sm text-on-surface-variant truncate">{user.email}</p>
              </div>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
