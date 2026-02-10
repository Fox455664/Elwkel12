import { Navigate, Outlet } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { currentRole, userProfile } = useAppStore();

  // لو مش مسجل دخول، ارجعه لصفحة الدخول
  if (!currentRole || !userProfile) {
    return <Navigate to="/login" replace />;
  }

  // لو مسجل بس دوره غير مسموح (مثلا سائق يحاول يدخل صفحة الأدمن)
  if (!allowedRoles.includes(currentRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
