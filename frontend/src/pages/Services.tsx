// src/pages/Services.tsx
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
    TablePagination,
    TableSortLabel,
    TextField,
    Typography,
    Snackbar,
    Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface Service {
    id: number;
    name: string;
    description: string;
    duration: number;
    price: number;
}

type Order = "asc" | "desc";

export default function ServicesPage() {
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    const [services, setServices] = useState<Service[]>([]);
    const [search, setSearch] = useState("");
    const [minPrice, setMinPrice] = useState<number | "">("");
    const [maxPrice, setMaxPrice] = useState<number | "">("");
    const [minDuration, setMinDuration] = useState<number | "">("");
    const [maxDuration, setMaxDuration] = useState<number | "">("");

    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState<Partial<Service>>({
        name: "",
        description: "",
        duration: 30,
        price: 0,
    });

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({ open: false, message: "", severity: "success" });

    // сортировка
    const [order, setOrder] = useState<Order>("asc");
    const [orderBy, setOrderBy] = useState<keyof Service>("name");

    // пагинация
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // загрузка
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
            .then(data => setServices(data))
            .catch(() => setServices([]));
    };

    useEffect(() => {
        load();
    }, [token]);

    // сортируем и фильтруем
    const filtered = services
        .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
        .filter(s => (minPrice === "" || s.price >= minPrice))
        .filter(s => (maxPrice === "" || s.price <= maxPrice))
        .filter(s => (minDuration === "" || s.duration >= minDuration))
        .filter(s => (maxDuration === "" || s.duration <= maxDuration));

    const sorted = filtered.sort((a, b) => {
        const isAsc = order === "asc";
        if (a[orderBy] < b[orderBy]) return isAsc ? -1 : 1;
        if (a[orderBy] > b[orderBy]) return isAsc ? 1 : -1;
        return 0;
    });

    const paginated = sorted.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    // CRUD + уведомления
    const handleSave = () => {
        if (!form.name || form.duration! <= 0 || form.price! < 0) {
            setSnackbar({
                open: true,
                message: "Заполните все поля корректно",
                severity: "error",
            });
            return;
        }
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
            .then(res => {
                if (!res.ok) throw new Error();
                setSnackbar({
                    open: true,
                    message: form.id ? "Услуга обновлена" : "Услуга добавлена",
                    severity: "success",
                });
                setDialogOpen(false);
                load();
            })
            .catch(() =>
                setSnackbar({ open: true, message: "Ошибка сохранения", severity: "error" })
            );
    };

    const handleDelete = (id: number) => {
        if (!window.confirm("Удалить эту услугу?")) return;
        fetch(`${import.meta.env.VITE_API_URL}/services/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => {
                if (!res.ok) throw new Error();
                setSnackbar({ open: true, message: "Услуга удалена", severity: "success" });
                load();
            })
            .catch(() =>
                setSnackbar({ open: true, message: "Ошибка удаления", severity: "error" })
            );
    };

    // обработчики сортировки и пагинации
    const handleRequestSort = (property: keyof Service) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
    const handleChangeRows = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    return (
        <Box>
            {/* Заголовок + фильтры */}
            <Box display="flex" flexWrap="wrap" gap={2} mb={2} alignItems="center">
                <Typography variant="h5" flexGrow={1}>
                    Услуги
                </Typography>
                <TextField
                    size="small"
                    label="Поиск по названию"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <TextField
                    size="small"
                    type="number"
                    label="Мин. цена"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value === "" ? "" : +e.target.value)}
                />
                <TextField
                    size="small"
                    type="number"
                    label="Макс. цена"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value === "" ? "" : +e.target.value)}
                />
                <TextField
                    size="small"
                    type="number"
                    label="Мин. длительность"
                    value={minDuration}
                    onChange={e => setMinDuration(e.target.value === "" ? "" : +e.target.value)}
                />
                <TextField
                    size="small"
                    type="number"
                    label="Макс. длительность"
                    value={maxDuration}
                    onChange={e => setMaxDuration(e.target.value === "" ? "" : +e.target.value)}
                />
                <IconButton onClick={load} title="Обновить">
                    <RefreshIcon />
                </IconButton>
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

            {/* Таблица */}
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {[
                                { id: "name", label: "Название" },
                                { id: "description", label: "Описание" },
                                { id: "duration", label: "Длительность" },
                                { id: "price", label: "Цена" },
                            ].map(col => (
                                <TableCell
                                    key={col.id}
                                    sortDirection={orderBy === col.id ? order : false}
                                    align={col.id === "price" ? "right" : "left"}
                                >
                                    <TableSortLabel
                                        active={orderBy === col.id}
                                        direction={orderBy === col.id ? order : "asc"}
                                        onClick={() => handleRequestSort(col.id as keyof Service)}
                                    >
                                        {col.label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                            <TableCell align="center">Действия</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {paginated.map(s => (
                            <TableRow key={s.id} hover>
                                <TableCell>{s.name}</TableCell>
                                <TableCell>{s.description}</TableCell>
                                <TableCell>{s.duration}</TableCell>
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
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDelete(s.id)}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {paginated.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    Нет услуг
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Пагинация */}
            <TablePagination
                component="div"
                count={sorted.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRows}
                rowsPerPageOptions={[5, 10, 25]}
            />

            {/* Диалог редактирования */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {form.id ? "Редактировать услугу" : "Новая услуга"}
                </DialogTitle>
                <DialogContent dividers>
                    <TextField
                        fullWidth
                        label="Название"
                        value={form.name || ""}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Описание"
                        value={form.description || ""}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        margin="normal"
                        multiline
                        rows={3}
                    />
                    <TextField
                        fullWidth
                        label="Длительность (мин)"
                        type="number"
                        value={form.duration}
                        onChange={e => setForm(f => ({ ...f, duration: +e.target.value }))}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Цена (₽)"
                        type="number"
                        value={form.price}
                        onChange={e => setForm(f => ({ ...f, price: +e.target.value }))}
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

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
            >
                <Alert
                    onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
