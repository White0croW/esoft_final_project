import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    TextField,
    Container,
    Typography,
    CircularProgress,
    Snackbar,
    Alert,
    Avatar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface Profile {
    name: string;
    email: string;
    phone?: string;
}

export default function ProfilePage() {
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    const [data, setData] = useState<Profile>({ name: "", email: "", phone: "" });
    const [edit, setEdit] = useState(false);
    const [loading, setLoading] = useState(true);

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
        open: false,
        message: "",
        severity: "success",
    });

    useEffect(() => {
        if (!token) return;

        fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => {
                if (res.status === 401) {
                    logout();
                    navigate("/signin", { replace: true });
                    return Promise.reject();
                }
                if (!res.ok) return Promise.reject(`Error ${res.status}`);
                return res.json() as Promise<Profile>;
            })
            .then(setData)
            .catch(() => setData({ name: "", email: "", phone: "" }))
            .finally(() => setLoading(false));
    }, [token]);

    const save = () => {
        if (!data.name || !data.email) {
            setSnackbar({ open: true, message: "Имя и email обязательны", severity: "error" });
            return;
        }

        fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        })
            .then(res => {
                if (res.status === 401) {
                    logout();
                    navigate("/signin", { replace: true });
                    return;
                }
                if (!res.ok) throw new Error(`Error ${res.status}`);
                setSnackbar({ open: true, message: "Профиль обновлён", severity: "success" });
                setEdit(false);
            })
            .catch(() => {
                setSnackbar({ open: true, message: "Ошибка при сохранении", severity: "error" });
            });
    };

    const changePassword = () => {
        if (!password || password !== confirm) {
            setSnackbar({ open: true, message: "Пароли не совпадают", severity: "error" });
            return;
        }

        fetch(`${import.meta.env.VITE_API_URL}/users/password`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ password }),
        })
            .then(res => {
                if (res.status === 401) {
                    logout();
                    navigate("/signin", { replace: true });
                    return;
                }
                if (!res.ok) throw new Error(`Error ${res.status}`);
                setSnackbar({ open: true, message: "Пароль обновлён", severity: "success" });
                setPassword("");
                setConfirm("");
            })
            .catch(() => {
                setSnackbar({ open: true, message: "Ошибка при смене пароля", severity: "error" });
            });
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={8}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Card>
                <CardHeader
                    avatar={<Avatar>{data.name.charAt(0).toUpperCase()}</Avatar>}
                    title="Профиль"
                    action={
                        <Button onClick={() => setEdit(e => !e)}>
                            {edit ? "Просмотр" : "Редактировать"}
                        </Button>
                    }
                />
                <CardContent>
                    {edit ? (
                        <Box display="grid" gap={2}>
                            <TextField
                                label="Имя"
                                fullWidth
                                value={data.name}
                                onChange={e => setData(d => ({ ...d, name: e.target.value }))}
                            />
                            <TextField
                                label="Email"
                                type="email"
                                fullWidth
                                value={data.email}
                                onChange={e => setData(d => ({ ...d, email: e.target.value }))}
                            />
                            <TextField
                                label="Телефон"
                                fullWidth
                                value={data.phone || ""}
                                onChange={e => setData(d => ({ ...d, phone: e.target.value }))}
                            />
                            <Box display="flex" justifyContent="flex-end" mt={2}>
                                <Button onClick={() => setEdit(false)} sx={{ mr: 1 }}>
                                    Отмена
                                </Button>
                                <Button variant="contained" onClick={save}>
                                    Сохранить
                                </Button>
                            </Box>
                        </Box>
                    ) : (
                        <Box display="grid" gap={1}>
                            <Typography><strong>Имя:</strong> {data.name}</Typography>
                            <Typography><strong>Email:</strong> {data.email}</Typography>
                            {data.phone && (
                                <Typography><strong>Телефон:</strong> {data.phone}</Typography>
                            )}
                        </Box>
                    )}
                </CardContent>
            </Card>

            <Card sx={{ mt: 4 }}>
                <CardHeader title="Сменить пароль" />
                <CardContent>
                    <Box display="grid" gap={2}>
                        <TextField
                            label="Новый пароль"
                            type="password"
                            fullWidth
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <TextField
                            label="Повторите пароль"
                            type="password"
                            fullWidth
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                        />
                        <Box display="flex" justifyContent="flex-end">
                            <Button variant="contained" onClick={changePassword}>
                                Обновить пароль
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}
