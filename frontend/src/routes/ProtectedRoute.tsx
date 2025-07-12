import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { CircularProgress, Box } from "@mui/material";

interface ProtectedRouteProps {
    role?: "user" | "admin";
}

export default function ProtectedRoute({ role }: ProtectedRouteProps) {
    const { user, initialized } = useAuth();

    // Ждём инициации (чтения из localStorage)
    if (!initialized) {
        return (
            <Box display="flex" justifyContent="center" mt={8}>
                <CircularProgress />
            </Box>
        );
    }

    // Если не залогинен — на вход
    if (!user) {
        return <Navigate to="/signin" replace />;
    }

    // Если передана роль, проверяем
    if (role && user.role !== role) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Всё ок — рендерим вложенные маршруты
    return <Outlet />;
}
