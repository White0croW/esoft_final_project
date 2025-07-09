import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface Service {
    id: number;
    name: string;
    description: string;
    duration: number;
    price: number;
}

export default function ServicesPage() {
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    const [services, setServices] = useState<Service[]>([]);
    const [filtered, setFiltered] = useState<Service[]>([]);
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState<Partial<Service>>({ name: "", description: "", duration: 30, price: 0 });

    const load = () => {
        if (!token) return;
        fetch(`${import.meta.env.VITE_API_URL}/services`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => {
                if (res.status === 401) {
                    logout();
                    navigate("/signin", { replace: true });
                    return Promise.reject();
                }
                if (!res.ok) return Promise.reject(`Error ${res.status}`);
                return res.json() as Promise<Service[]>;
            })
            .then(data => {
                setServices(data);
                setFiltered(data);
            })
            .catch(() => {
                setServices([]);
                setFiltered([]);
            });
    };

    useEffect(() => {
        load();
    }, [token]);

    useEffect(() => {
        setFiltered(
            services.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
        );
    }, [search, services]);

    const handleSave = () => {
        const method = form.id ? "PUT" : "POST";
        const url = form.id ? `/services/${form.id}` : "/services";

        fetch(`${import.meta.env.VITE_API_URL}${url}`, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(form),
        })
            .then(() => {
                setDialogOpen(false);
                load();
            })
            .catch(console.error);
    };

    return (
        <Box>
            <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h5" sx={{ flexGrow: 1 }}>Услуги</Typography>
                <TextField
                    size="small"
                    placeholder="Поиск..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    sx={{ mr: 2 }}
                />
                <IconButton onClick={load} title="Обновить"><RefreshIcon /></IconButton>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setForm({ name: "", description: "", duration: 30, price: 0 });
                        setDialogOpen(true);
                    }}
                >
                    Добавить
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Название</TableCell>
                            <TableCell>Описание</TableCell>
                            <TableCell align="center">Длительность</TableCell>
                            <TableCell align="right">Цена</TableCell>
                            <TableCell align="center">Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.map(s => (
                            <TableRow key={s.id} hover>
                                <TableCell>{s.name}</TableCell>
                                <TableCell>{s.description}</TableCell>
                                <TableCell align="center">{s.duration}</TableCell>
                                <TableCell align="right">{s.price}</TableCell>
                                <TableCell align="center">
                                    <Button
                                        size="small"
                                        onClick={() => {
                                            setForm(s);
                                            setDialogOpen(true);
                                        }}
                                    >
                                        Ред.
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filtered.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    Нет услуг
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                fullWidth maxWidth="sm"
            >
                <DialogTitle>{form.id ? "Редактировать услугу" : "Новая услуга"}</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        fullWidth label="Название"
                        value={form.name || ""}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        margin="normal"
                    />
                    <TextField
                        fullWidth label="Описание"
                        value={form.description || ""}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        margin="normal" multiline rows={3}
                    />
                    <TextField
                        fullWidth label="Длительность"
                        type="number"
                        value={form.duration}
                        onChange={e => setForm(f => ({ ...f, duration: +e.target.value }))}
                        margin="normal"
                    />
                    <TextField
                        fullWidth label="Цена"
                        type="number"
                        value={form.price}
                        onChange={e => setForm(f => ({ ...f, price: +e.target.value }))}
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
                    <Button variant="contained" onClick={handleSave}>Сохранить</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}