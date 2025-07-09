// src/pages/SignIn.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
    Alert,
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Paper,
} from "@mui/material";

export default function SignIn() {
    const { login } = useAuth();
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!email || !password) {
            setError("Все поля обязательны");
            return;
        }
        try {
            await login({ email, password });
            nav("/");
        } catch (err: any) {
            setError(err.message || "Ошибка входа");
        }
    };

    return (
        <Container maxWidth="xs">
            <Paper sx={{ mt: 8, p: 4 }}>
                <Typography variant="h5" align="center" gutterBottom>
                    Вход
                </Typography>
                {error && <Alert severity="error">{error}</Alert>}
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: "grid", gap: 2 }}>
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
                    <Button type="submit" variant="contained" fullWidth>
                        Войти
                    </Button>
                </Box>
                <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                    Нет аккаунта? <Link to="/signup">Регистрация</Link>
                </Typography>
            </Paper>
        </Container>
    );
}
