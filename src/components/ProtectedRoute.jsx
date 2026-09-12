import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { canAccess } from "../roleAccess";

export function ProtectedRoute({ section, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (section && !canAccess(user.role, section)) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center mt-12 bg-white rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Access Restricted</h2>
        <p className="text-sm text-slate-600 mb-4">
          Your account role (<span className="font-semibold capitalize">{user.role}</span>) does not have access to this section.
        </p>
        <a
          href="/app"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          Return to Dashboard
        </a>
      </div>
    );
  }

  return children ? children : <Outlet />;
}

export default ProtectedRoute;
