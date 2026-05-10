import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@store/authSlice';

const RoleRoute = ({ allowedRoles }) => {
  const user = useSelector(selectCurrentUser);
  if (!user || !allowedRoles.includes(user.rol)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

export default RoleRoute;
