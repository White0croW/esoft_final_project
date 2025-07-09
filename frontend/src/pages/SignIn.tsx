import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
    Alert,
    Box,
    Container,
    Paper,
    Snackbar,
    TextField,
    Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";

export default function SignIn() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "error" | "success";
    }>({ open: false, message: "", severity: "error" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setSnackbar({ open: true, message: "Все поля обязательны", severity: "error" });
            return;
        }

        setLoading(true);
        try {
            await login({ email, password });
            navigate("/", { replace: true });
        } catch (err: any) {
            setSnackbar({ open: true, message: err.message || "Ошибка входа", severity: "error" });
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xs">
            <Paper sx={{ mt: 8, p: 4 }}>
                <Typography variant="h5" align="center" gutterBottom>
                    Вход
                </Typography>

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{ mt: 2, display: "grid", gap: 2 }}
                >
                    <TextField
                        label="Email"
                        type="email"
                        fullWidth
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />

                    <TextField
                        label="Пароль"
                        type="password"
                        fullWidth
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />

                    <LoadingButton
                        type="submit"
                        variant="contained"
                        fullWidth
                        loading={loading}
                    >
                        Войти
                    </LoadingButton>
                </Box>

                <Typography
                    variant="body2"
                    align="center"
                    sx={{ mt: 2 }}
                >
                    Нет аккаунта?{" "}
                    <RouterLink to="/signup" style={{ textDecoration: "none", color: "#1976d2" }}>
                        Регистрация
                    </RouterLink>
                </Typography>
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}
