import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/useAuth";


function AdminRoute() {
  const {
    isAuthenticated,
    isAdmin,
    loading,
  } = useAuth();


  if (loading) {
    return (
      <div className="auth-loading">
        Checking administrative access...
      </div>
    );
  }


  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  if (!isAdmin) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }


  return <Outlet />;
}


export default AdminRoute;