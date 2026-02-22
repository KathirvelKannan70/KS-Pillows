import { Navigate } from "react-router-dom";

export default function ProtectedAuth({ children }) {
  const token = localStorage.getItem("token");

  // ✅ If already logged in → block login/signup
  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
}