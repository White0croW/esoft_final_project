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

export default function SignUp() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "error" | "success";
    }>({ open: false, message: "", severity: "error" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password) {
            setSnackbar({
                open: true,
                message: "Заполните все поля",
                severity: "error",
            });
            return;
        }
        if (password !== password2) {
            setSnackbar({
                open: true,
                message: "Пароли не совпадают",
                severity: "error",
            });
            return;
        }

        setLoading(true);
        try {
            await register({ name, email, password });
            setSnackbar({
                open: true,
                message: "Регистрация успешна",
                severity: "success",
            });
            setTimeout(() => navigate("/", { replace: true }), 800);
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.message || "Ошибка регистрации",
                severity: "error",
            });
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xs">
            <Paper sx={{ mt: 8, p: 4 }}>
                <Typography variant="h5" align="center" gutterBottom>
                    Регистрация
                </Typography>

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{ mt: 2, display: "grid", gap: 2 }}
                >
                    <TextField
                        label="Имя"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <TextField
                        label="Email"
                        type="email"
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <TextField
                        label="Пароль"
                        type="password"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <TextField
                        label="Повторите пароль"
                        type="password"
                        fullWidth
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                    />

                    <LoadingButton
                        type="submit"
                        variant="contained"
                        fullWidth
                        loading={loading}
                    >
                        Зарегистрироваться
                    </LoadingButton>
                </Box>

                <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                    Уже есть аккаунт?{" "}
                    <RouterLink
                        to="/signin"
                        style={{ textDecoration: "none", color: "#1976d2" }}
                    >
                        Войти
                    </RouterLink>
                </Typography>
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}
