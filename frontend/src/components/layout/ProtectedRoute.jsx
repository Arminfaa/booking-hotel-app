import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

/**
 * Mount children immediately so page data can load in parallel with /auth/me.
 * Redirect only after the session check finishes without a user.
 * Shell (Navbar) is already visible via the parent route layout.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, booting } = useAuth();
  const location = useLocation();

  if (!booting && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
