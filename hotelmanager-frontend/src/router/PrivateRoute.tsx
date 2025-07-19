import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

const PrivateRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const user = useAuth();

  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" />;

  return <Outlet />;
};

export default PrivateRoute;
