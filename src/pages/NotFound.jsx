import { Link } from 'react-router-dom';
import { Button } from '@components/atoms';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface px-4">
    <div className="text-center space-y-5 max-w-sm">
      <p className="text-[8rem] leading-none font-bold text-outline-variant select-none">404</p>
      <div className="space-y-2">
        <h1 className="text-headline-sm text-on-surface font-medium">Página no encontrada</h1>
        <p className="text-body-md text-on-surface-variant">
          La dirección que ingresaste no existe o no tenés acceso.
        </p>
      </div>
      <Link to="/dashboard">
        <Button>Ir al Dashboard</Button>
      </Link>
    </div>
  </div>
);

export default NotFound;
