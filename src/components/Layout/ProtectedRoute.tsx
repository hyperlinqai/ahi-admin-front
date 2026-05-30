import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const ProtectedRoute = () => {
    const { isAuthenticated, user, logout } = useAuthStore();
    const location = useLocation();

    const isAdmin = isAuthenticated && user?.role === "ADMIN";

    if (!isAdmin) {
        // Clear storefront / stale sessions so Login does not bounce back to "/"
        if (isAuthenticated && user?.role !== "ADMIN") {
            logout();
        }

        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
