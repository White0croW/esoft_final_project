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
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    TextField,
    Typography,
    Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
    getServices,
    createService,
    updateService,
    deleteService,
} from "../api/services";
import { Service } from "../types";

type Order = "asc" | "desc";

export default function ServicesPage() {
    const { logout } = useAuth();
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

    const [order, setOrder] = useState<Order>("asc");
    const [orderBy, setOrderBy] = useState<keyof Service>("name");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Загрузка списка услуг
    const load = async () => {
        try {
            const data = await getServices();
            setServices(data);
        } catch (err: any) {
            if (err.response?.status === 401) {
                logout();
                navigate("/signin", { replace: true });
            } else {
                setServices([]);
                setSnackbar({
                    open: true,
                    message: err.message || "Ошибка загрузки услуг",
                    severity: "error",
                });
            }
        }
    };

    useEffect(() => {
        load();
    }, []);

    // Фильтрация
    const filtered = services
        .filter((s) =>
            s.name.toLowerCase().includes(search.toLowerCase())
        )
        .filter((s) => (minPrice === "" || s.price >= minPrice))
        .filter((s) => (maxPrice === "" || s.price <= maxPrice))
        .filter((s) => (minDuration === "" || s.duration >= minDuration))
        .filter((s) => (maxDuration === "" || s.duration <= maxDuration));

    // Сортировка
    const sorted = filtered.sort((a, b) => {
        const isAsc = order === "asc";
        if (a[orderBy]! < b[orderBy]!) return isAsc ? -1 : 1;
        if (a[orderBy]! > b[orderBy]!) return isAsc ? 1 : -1;
        return 0;
    });

    // Пагинация
    const paginated = sorted.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const handleRequestSort = (property: keyof Service) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const handleChangePage = (_: unknown, newPage: number) =>
        setPage(newPage);

    const handleChangeRows = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    // Сохранение (создать или обновить)
    const handleSave = async () => {
        if (!form.name || form.duration! <= 0 || form.price! < 0) {
            setSnackbar({
                open: true,
                message: "Заполните все поля корректно",
                severity: "error",
            });
            return;
        }
        try {
            if (form.id) {
                await updateService(form.id, {
                    name: form.name!,
                    description: form.description,
                    duration: form.duration!,
                    price: form.price!,
                });
                setSnackbar({
                    open: true,
                    message: "Услуга обновлена",
                    severity: "success",
                });
            } else {
                await createService({
                    name: form.name!,
                    description: form.description,
                    duration: form.duration!,
                    price: form.price!,
                });
                setSnackbar({
                    open: true,
                    message: "Услуга добавлена",
                    severity: "success",
                });
            }
            setDialogOpen(false);
            load();
        } catch {
            setSnackbar({
                open: true,
                message: "Ошибка сохранения услуги",
                severity: "error",
            });
        }
    };

    // Удаление услуги
    const handleDelete = async (id: number) => {
        if (!window.confirm("Удалить эту услугу?")) return;
        try {
            await deleteService(id);
            setSnackbar({
                open: true,
                message: "Услуга удалена",
                severity: "success",
            });
            load();
        } catch {
            setSnackbar({
                open: true,
                message: "Ошибка удаления услуги",
                severity: "error",
            });
        }
    };

    return (
        <Box>
            {/* Заголовок и фильтры */}
            <Box
                display="flex"
                flexWrap="wrap"
                gap={2}
                mb={2}
                alignItems="center"
            >
                <Typography variant="h5" flexGrow={1}>
                    Услуги
                </Typography>
                <TextField
                    size="small"
                    label="Поиск"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <TextField
                    size="small"
                    label="Мин. цена"
                    type="number"
                    value={minPrice}
                    onChange={(e) =>
                        setMinPrice(e.target.value === "" ? "" : +e.target.value)
                    }
                />
                <TextField
                    size="small"
                    label="Макс. цена"
                    type="number"
                    value={maxPrice}
                    onChange={(e) =>
                        setMaxPrice(e.target.value === "" ? "" : +e.target.value)
                    }
                />
                <TextField
                    size="small"
                    label="Мин. длит. (мин)"
                    type="number"
                    value={minDuration}
                    onChange={(e) =>
                        setMinDuration(e.target.value === "" ? "" : +e.target.value)
                    }
                />
                <TextField
                    size="small"
                    label="Макс. длит. (мин)"
                    type="number"
                    value={maxDuration}
                    onChange={(e) =>
                        setMaxDuration(e.target.value === "" ? "" : +e.target.value)
                    }
                />
                <IconButton onClick={load} title="Обновить">
                    <RefreshIcon />
                </IconButton>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setForm({
                            name: "",
                            description: "",
                            duration: 30,
                            price: 0,
                        });
                        setDialogOpen(true);
                    }}
                >
                    Добавить
                </Button>
            </Box>

            {/* Таблица услуг */}
            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {(
                                    ["name", "description", "duration", "price"] as Array<
                                        keyof Service
                                    >
                                ).map((key) => (
                                    <TableCell key={key}>
                                        <TableSortLabel
                                            active={orderBy === key}
                                            direction={order}
                                            onClick={() => handleRequestSort(key)}
                                        >
                                            {key === "name"
                                                ? "Название"
                                                : key === "description"
                                                    ? "Описание"
                                                    : key === "duration"
                                                        ? "Длительность"
                                                        : "Цена"}
                                        </TableSortLabel>
                                    </TableCell>
                                ))}
                                <TableCell>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginated.map((s) => (
                                <TableRow key={s.id} hover>
                                    <TableCell>{s.name}</TableCell>
                                    <TableCell>
                                        {s.description ?? "-"}
                                    </TableCell>
                                    <TableCell>{s.duration}</TableCell>
                                    <TableCell>{s.price}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            onClick={() => {
                                                setForm(s);
                                                setDialogOpen(true);
                                            }}
                                        >
                                            ✏️
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDelete(s.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={sorted.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRows}
                />
            </Paper>

            {/* Диалог создания/редактирования */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {form.id ? "Редактировать услугу" : "Новая услуга"}
                </DialogTitle>
                <DialogContent dividers sx={{ display: "grid", gap: 2 }}>
                    <TextField
                        label="Название"
                        fullWidth
                        value={form.name}
                        onChange={(e) =>
                            setForm((f) => ({ ...f, name: e.target.value }))
                        }
                    />
                    <TextField
                        label="Описание"
                        fullWidth
                        value={form.description ?? ""}
                        onChange={(e) =>
                            setForm((f) => ({ ...f, description: e.target.value }))
                        }
                    />
                    <TextField
                        label="Длительность (мин)"
                        type="number"
                        fullWidth
                        value={form.duration}
                        onChange={(e) =>
                            setForm((f) => ({
                                ...f,
                                duration: +e.target.value,
                            }))
                        }
                    />
                    <TextField
                        label="Цена"
                        type="number"
                        fullWidth
                        value={form.price}
                        onChange={(e) =>
                            setForm((f) => ({
                                ...f,
                                price: +e.target.value,
                            }))
                        }
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
                    <Button variant="contained" onClick={handleSave}>
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Снекбар */}
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
