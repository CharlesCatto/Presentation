import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return isAuthenticated() ? <Outlet /> : <Navigate to="/connexion" />;
}

export default ProtectedRoute;
