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
    Snackbar,
    Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
    getBarbers,
    createBarber,
    updateBarber,
    deleteBarber,
} from "../api/barbers";
import { Barber } from "../types";

export default function BarbersPage() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [list, setList] = useState<Barber[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState<Partial<Barber>>({
        name: "",
        experience: 1,
    });
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({ open: false, message: "", severity: "success" });

    const load = async () => {
        try {
            const data = await getBarbers();
            setList(data);
        } catch (err: any) {
            if (err.response?.status === 401) {
                logout();
                navigate("/signin", { replace: true });
            } else {
                setSnackbar({
                    open: true,
                    message: err.message || "Ошибка загрузки мастеров",
                    severity: "error",
                });
            }
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleSave = async () => {
        if (!form.name || form.experience! < 0) {
            setSnackbar({
                open: true,
                message: "Введите имя и корректный опыт",
                severity: "error",
            });
            return;
        }

        try {
            if (form.id) {
                await updateBarber(form.id, {
                    name: form.name!,
                    experience: form.experience!,
                });
                setSnackbar({
                    open: true,
                    message: "Мастер обновлён",
                    severity: "success",
                });
            } else {
                await createBarber({
                    name: form.name!,
                    experience: form.experience!,
                });
                setSnackbar({
                    open: true,
                    message: "Мастер добавлен",
                    severity: "success",
                });
            }
            setDialogOpen(false);
            load();
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.message || "Ошибка сохранения мастера",
                severity: "error",
            });
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Удалить этого мастера?")) return;

        try {
            await deleteBarber(id);
            setSnackbar({
                open: true,
                message: "Мастер удалён",
                severity: "success",
            });
            load();
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.message || "Ошибка удаления мастера",
                severity: "error",
            });
        }
    };

    return (
        <Box>
            <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h5" sx={{ flexGrow: 1 }}>
                    Мастера
                </Typography>
                <IconButton onClick={load} title="Обновить">
                    <RefreshIcon />
                </IconButton>
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
                            <TableCell align="center">Опыт (лет)</TableCell>
                            <TableCell align="center">Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {list.map((b) => (
                            <TableRow key={b.id} hover>
                                <TableCell>{b.name}</TableCell>
                                <TableCell align="center">{b.experience}</TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            setForm(b);
                                            setDialogOpen(true);
                                        }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDelete(b.id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
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

            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {form.id ? "Редактировать мастера" : "Новый мастер"}
                </DialogTitle>
                <DialogContent dividers>
                    <TextField
                        fullWidth
                        label="Имя"
                        value={form.name || ""}
                        onChange={(e) =>
                            setForm((f) => ({ ...f, name: e.target.value }))
                        }
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Опыт (лет)"
                        type="number"
                        value={form.experience}
                        onChange={(e) =>
                            setForm((f) => ({
                                ...f,
                                experience: +e.target.value,
                            }))
                        }
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
                    <Button variant="contained" onClick={handleSave}>
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>

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
        </Box>
    );
}
