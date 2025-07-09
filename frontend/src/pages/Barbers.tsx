import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface Barber {
    id: number;
    name: string;
    experience: number;
}

export default function BarbersPage() {
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    const [list, setList] = useState<Barber[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState<Partial<Barber>>({ name: "", experience: 1 });

    const load = () => {
        if (!token) return;
        fetch(`${import.meta.env.VITE_API_URL}/barbers`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => {
                if (res.status === 401) {
                    logout();
                    navigate("/signin", { replace: true });
                    return Promise.reject();
                }
                if (!res.ok) return Promise.reject(`Error ${res.status}`);
                return res.json() as Promise<Barber[]>;
            })
            .then(setList)
            .catch(() => setList([]));
    };

    useEffect(() => {
        load();
    }, [token]);

    const save = () => {
        const method = form.id ? "PUT" : "POST";
        const url = form.id ? `/barbers/${form.id}` : "/barbers";

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
                <Typography variant="h5" sx={{ flexGrow: 1 }}>Мастера</Typography>
                <IconButton onClick={load} title="Обновить"><RefreshIcon /></IconButton>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setForm({ name: "", experience: 1 });
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
                            <TableCell>Имя</TableCell>
                            <TableCell align="center">Опыт</TableCell>
                            <TableCell align="center">Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {list.map(b => (
                            <TableRow key={b.id} hover>
                                <TableCell>{b.name}</TableCell>
                                <TableCell align="center">{b.experience}</TableCell>
                                <TableCell align="center">
                                    <Button
                                        size="small"
                                        onClick={() => {
                                            setForm(b);
                                            setDialogOpen(true);
                                        }}
                                    >
                                        Ред.
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {list.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                                    Нет мастеров
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{form.id ? "Редактировать" : "Новый мастер"}</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        fullWidth
                        label="Имя"
                        value={form.name || ""}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Опыт (лет)"
                        type="number"
                        value={form.experience}
                        onChange={e => setForm(f => ({ ...f, experience: +e.target.value }))}
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
                    <Button variant="contained" onClick={save}>Сохранить</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}