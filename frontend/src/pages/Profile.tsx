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
            .catch(() => setData({ name: "", email: "", phone: "" }));
    }, [token]);

    const save = () => {
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
                setEdit(false);
            })
            .catch(console.error);
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Card>
                <CardHeader
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
                                value={data.phone}
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
                        <Box>
                            <Typography><strong>Имя:</strong> {data.name}</Typography>
                            <Typography><strong>Email:</strong> {data.email}</Typography>
                            {data.phone && <Typography><strong>Телефон:</strong> {data.phone}</Typography>}
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
}