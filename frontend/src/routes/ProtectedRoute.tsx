// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

interface Props {
    role?: "admin";
}

export default function ProtectedRoute({ role }: Props) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!user) return <Navigate to="/signin" replace />;
    if (role && user.role !== role) return <Navigate to="/unauthorized" replace />;

    return <Outlet />;
}
