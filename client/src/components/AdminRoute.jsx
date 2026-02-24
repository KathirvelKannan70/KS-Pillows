import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
    const token = localStorage.getItem("token");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!token || !isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
}
