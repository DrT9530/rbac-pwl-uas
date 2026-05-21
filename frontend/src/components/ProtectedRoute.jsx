import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ requiredRoles, children }) {
  const { user, token, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const userRoles = (user.globalRoles || []).map((r) =>
      typeof r === 'string' ? r : r.name
    );
    const hasRequired = requiredRoles.some((role) => userRoles.includes(role));
    if (!hasRequired) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children || <Outlet />;
}
