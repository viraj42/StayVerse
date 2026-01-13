// utils/RoleRedirect.jsx
import { Navigate } from "react-router-dom";
import { useAuthContext } from "./AuthContext";

export default function RoleRedirect() {
  const { user, loading } = useAuthContext();
  if (loading) return null;


  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "host") {
    return <Navigate to="/host/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}
