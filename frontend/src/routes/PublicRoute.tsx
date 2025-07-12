import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { CircularProgress, Box } from "@mui/material";

export default function PublicRoute() {
    const { user, initialized } = useAuth();

    // Ждём завершения инициализации
    if (!initialized) {
        return (
            <Box display="flex" justifyContent="center" mt={8}>
                <CircularProgress />
            </Box>
        );
    }

    // Если пользователь уже авторизован — перенаправляем на главную
    if (user) {
        return <Navigate to="/profile" replace />;
    }

    // Всё ок — рендерим вложенные маршруты
    return <Outlet />;
}