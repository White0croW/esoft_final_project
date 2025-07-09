// src/pages/SignUp.tsx
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

export default function SignUp() {
    const { register } = useAuth();
    const nav = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!name || !email || !password) {
            setError("Заполните все поля");
            return;
        }
        if (password !== password2) {
            setError("Пароли не совпадают");
            return;
        }
        try {
            await register({ name, email, password });
            nav("/");
        } catch (err: any) {
            setError(err.message || "Ошибка регистрации");
        }
    };

    return (
        <Container maxWidth="xs">
            <Paper sx={{ mt: 8, p: 4 }}>
                <Typography variant="h5" align="center" gutterBottom>
                    Регистрация
                </Typography>
                {error && <Alert severity="error">{error}</Alert>}
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: "grid", gap: 2 }}>
                    <TextField
                        label="Имя"
                        fullWidth
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
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
                    <TextField
                        label="Повторите пароль"
                        type="password"
                        fullWidth
                        value={password2}
                        onChange={e => setPassword2(e.target.value)}
                    />
                    <Button type="submit" variant="contained" fullWidth>
                        Зарегистрироваться
                    </Button>
                </Box>
                <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                    Уже есть аккаунт? <Link to="/signin">Войти</Link>
                </Typography>
            </Paper>
        </Container>
    );
}
