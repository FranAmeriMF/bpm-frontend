import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCurrentUser, selectIsAuthenticated, logout } from '@store/authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const logoutUser = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return { user, isAuthenticated, logout: logoutUser };
}
