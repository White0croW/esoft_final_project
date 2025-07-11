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
import {
    getProfile,
    updateProfile,
    changePassword,
    Profile,
} from "../api/profile";

export default function ProfilePage() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [data, setData] = useState<Profile>({
        name: "",
        email: "",
        phone: "",
    });
    const [edit, setEdit] = useState(false);
    const [loading, setLoading] = useState(true);

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({ open: false, message: "", severity: "success" });

    useEffect(() => {
        getProfile()
            .then(setData)
            .catch((err) => {
                if (err.response?.status === 401) {
                    logout();
                    navigate("/signin", { replace: true });
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const saveProfile = async () => {
        if (!data.name || !data.email) {
            setSnackbar({
                open: true,
                message: "Имя и email обязательны",
                severity: "error",
            });
            return;
        }
        try {
            await updateProfile(data);
            setSnackbar({
                open: true,
                message: "Профиль обновлён",
                severity: "success",
            });
            setEdit(false);
        } catch {
            setSnackbar({
                open: true,
                message: "Ошибка при сохранении профиля",
                severity: "error",
            });
        }
    };

    const submitPassword = async () => {
        if (!oldPassword || !newPassword) {
            setSnackbar({
                open: true,
                message: "Оба поля обязательны",
                severity: "error",
            });
            return;
        }
        if (newPassword !== confirm) {
            setSnackbar({
                open: true,
                message: "Пароли не совпадают",
                severity: "error",
            });
            return;
        }
        try {
            await changePassword(oldPassword, newPassword);
            setSnackbar({
                open: true,
                message: "Пароль обновлён",
                severity: "success",
            });
            setOldPassword("");
            setNewPassword("");
            setConfirm("");
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.response?.data?.message || "Ошибка при смене пароля",
                severity: "error",
            });
        }
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
                        <Button onClick={() => setEdit((e) => !e)}>
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
                                onChange={(e) =>
                                    setData((d) => ({ ...d, name: e.target.value }))
                                }
                            />
                            <TextField
                                label="Email"
                                type="email"
                                fullWidth
                                value={data.email}
                                onChange={(e) =>
                                    setData((d) => ({ ...d, email: e.target.value }))
                                }
                            />
                            <TextField
                                label="Телефон"
                                fullWidth
                                value={data.phone ?? ""}
                                onChange={(e) =>
                                    setData((d) => ({ ...d, phone: e.target.value }))
                                }
                            />
                            <Box display="flex" justifyContent="flex-end" mt={2}>
                                <Button onClick={() => setEdit(false)} sx={{ mr: 1 }}>
                                    Отмена
                                </Button>
                                <Button variant="contained" onClick={saveProfile}>
                                    Сохранить
                                </Button>
                            </Box>
                        </Box>
                    ) : (
                        <Box display="grid" gap={1}>
                            <Typography>
                                <strong>Имя:</strong> {data.name}
                            </Typography>
                            <Typography>
                                <strong>Email:</strong> {data.email}
                            </Typography>
                            {data.phone && (
                                <Typography>
                                    <strong>Телефон:</strong> {data.phone}
                                </Typography>
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
                            label="Старый пароль"
                            type="password"
                            fullWidth
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                        />
                        <TextField
                            label="Новый пароль"
                            type="password"
                            fullWidth
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <TextField
                            label="Повторите пароль"
                            type="password"
                            fullWidth
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                        />
                        <Box display="flex" justifyContent="flex-end">
                            <Button variant="contained" onClick={submitPassword}>
                                Обновить пароль
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

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
