import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function AdminRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return user?.is_admin ? <Outlet /> : <Navigate to="/not-found" replace />;
}

export default AdminRoute;
