import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { canAccess } from "../roleAccess";

export default function ProtectedRoute({ children, section }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (section && !canAccess(user.role, section)) return <Navigate to="/app" replace />;
  return children;
}
