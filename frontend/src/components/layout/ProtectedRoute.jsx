import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Loader from "../ui/Loader";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, booting } = useAuth();
  const location = useLocation();

  if (booting) return <Loader label="Checking your session..." />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
