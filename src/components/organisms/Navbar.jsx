import { Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Popover, Transition } from '@headlessui/react';
import {
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  CheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '@hooks/useTheme';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@store/authSlice';
import {
  useGetNotificacionesQuery,
  useMarcarLeidaMutation,
  useMarcarTodasLeidasMutation,
} from '@api/notificacionesApi';
import { cn, ROL_LABELS, formatDate } from '@utils/helpers';

const TIPO_ICON = {
  info:    { Icon: InformationCircleIcon, color: 'text-primary' },
  success: { Icon: CheckCircleIcon,       color: 'text-tertiary' },
  warning: { Icon: ExclamationTriangleIcon, color: 'text-tertiary-container' },
  error:   { Icon: XCircleIcon,           color: 'text-error' },
};

// ── Single notification item ──────────────────────────────────────────────────
const NotifItem = ({ notif, onMarkRead, onClose }) => {
  const navigate = useNavigate();
  const { Icon, color } = TIPO_ICON[notif.tipo] ?? TIPO_ICON.info;
  const destino = notif.accion_url ?? (notif.tramite?.id ? `/tramites/${notif.tramite.id}` : null);

  const handleClick = () => {
    if (!notif.leida) onMarkRead(notif.id);
    if (destino) { onClose(); navigate(destino); }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full text-left px-4 py-3 border-b border-outline-variant/20 last:border-0 transition-colors hover:bg-surface-container',
        !notif.leida && 'bg-primary-fixed/10',
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', color)} />
        <div className="flex-1 min-w-0">
          <p className={cn('text-body-sm truncate', notif.leida ? 'text-on-surface-variant' : 'text-on-surface font-medium')}>
            {notif.titulo}
          </p>
          <p className="text-label-sm text-on-surface-variant mt-0.5 line-clamp-2">{notif.mensaje}</p>
          <p className="text-label-sm text-on-surface-variant/60 mt-1">
            {notif.fecha_creacion ? formatDate(notif.fecha_creacion, 'dd/MM HH:mm') : ''}
          </p>
        </div>
        {!notif.leida && (
          <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
        )}
      </div>
    </button>
  );
};

// ── Navbar ────────────────────────────────────────────────────────────────────
const Navbar = ({ user, onLogout, onMenuToggle }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { theme, toggleTheme } = useTheme();

  const { data: notificaciones } = useGetNotificacionesQuery(undefined, {
    pollingInterval: 30_000,
    skip: !isAuthenticated,
  });
  const [marcarLeida] = useMarcarLeidaMutation();
  const [marcarTodas] = useMarcarTodasLeidasMutation();

  const lista = notificaciones?.data ?? [];
  const noLeidas = lista.filter((n) => !n.leida).length;

  return (
    <nav className="h-16 flex-shrink-0 bg-surface-container-low/80 backdrop-blur-glass border-b border-outline-variant/20">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded hover:bg-surface-container transition-colors"
            aria-label="Abrir menú"
          >
            <Bars3Icon className="h-6 w-6 text-on-surface-variant" />
          </button>
          <h1 className="text-title-lg text-primary font-semibold">Sistema de Trámites</h1>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded hover:bg-surface-container transition-colors"
            aria-label="Cambiar tema"
          >
            {theme === 'dark'
              ? <SunIcon className="h-5 w-5 text-on-surface-variant" />
              : <MoonIcon className="h-5 w-5 text-on-surface-variant" />}
          </button>

          {/* Notifications Popover */}
          <Popover className="relative">
            <Popover.Button className="relative p-2 rounded hover:bg-surface-container transition-colors focus:outline-none">
              <BellIcon className="h-6 w-6 text-on-surface-variant" />
              {noLeidas > 0 && (
                <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-error text-on-error text-label-sm flex items-center justify-center rounded-full leading-none">
                  {noLeidas > 9 ? '9+' : noLeidas}
                </span>
              )}
            </Popover.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Popover.Panel className="absolute right-0 mt-2 w-80 bg-surface-container-low rounded shadow-ambient-lg z-50 focus:outline-none overflow-hidden">
                {({ close }) => (
                  <>
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20">
                      <p className="text-title-sm text-on-surface font-medium">Notificaciones</p>
                      {noLeidas > 0 && (
                        <button
                          onClick={() => marcarTodas()}
                          className="text-label-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <CheckIcon className="h-3.5 w-3.5" />
                          Marcar todas
                        </button>
                      )}
                    </div>

                    {/* List */}
                    <div className="max-h-72 overflow-y-auto">
                      {lista.length === 0 ? (
                        <p className="px-4 py-6 text-body-sm text-on-surface-variant text-center italic">
                          Sin notificaciones
                        </p>
                      ) : (
                        lista.slice(0, 8).map((n) => (
                          <NotifItem
                            key={n.id}
                            notif={n}
                            onMarkRead={(id) => marcarLeida(id)}
                            onClose={close}
                          />
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-outline-variant/20 px-4 py-2.5">
                      <Link
                        to="/notificaciones"
                        onClick={close}
                        className="text-label-sm text-primary hover:underline"
                      >
                        Ver todas las notificaciones →
                      </Link>
                    </div>
                  </>
                )}
              </Popover.Panel>
            </Transition>
          </Popover>

          {/* User Menu */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-2.5 pl-2 pr-3 py-2 rounded hover:bg-surface-container transition-colors">
              <UserCircleIcon className="h-7 w-7 text-on-surface-variant" />
              <div className="hidden sm:block text-left">
                <p className="text-body-md text-on-surface font-medium leading-tight">
                  {user ? `${user.nombre} ${user.apellido}` : 'Usuario'}
                </p>
                <p className="text-label-sm text-on-surface-variant leading-tight capitalize">
                  {user ? (ROL_LABELS[user.rol] ?? user.rol) : '—'}
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
              <Menu.Items className="absolute right-0 mt-2 w-52 bg-surface-container-low rounded shadow-ambient focus:outline-none py-1 z-50">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={cn(
                        'flex items-center w-full px-4 py-2.5 text-body-md text-on-surface gap-3 transition-colors',
                        active && 'bg-surface-container',
                      )}
                    >
                      <Cog6ToothIcon className="h-5 w-5 text-on-surface-variant" />
                      Configuración
                    </button>
                  )}
                </Menu.Item>
                <div className="my-1 border-t border-outline-variant/30" />
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={onLogout}
                      className={cn(
                        'flex items-center w-full px-4 py-2.5 text-body-md text-error gap-3 transition-colors',
                        active && 'bg-error-container/20',
                      )}
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      Cerrar Sesión
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
