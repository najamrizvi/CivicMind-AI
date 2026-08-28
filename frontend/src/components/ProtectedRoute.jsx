import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/useAuth";

function ProtectedRoute() {
  const {
    isAuthenticated,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading">
        Checking your CivicMind AI session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;