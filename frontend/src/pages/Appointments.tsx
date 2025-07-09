import React, { useEffect, useState } from "react";
import {
    Box,
    IconButton,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Tab,
    Tabs,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface Appointment {
    id: number;
    date: string;
    time: string;
    clientName: string;
    serviceName: string;
    barberName: string;
    status: "new" | "confirmed" | "done" | "canceled";
}

const tabs = [
    { label: "Услуги", path: "/services" },
    { label: "Мастера", path: "/barbers" },
    { label: "Записи", path: "/appointments" },
    { label: "Клиенты", path: "/clients" },
];

export default function AppointmentsPage() {
    const { token, logout } = useAuth();
    const navigate = useNavigate();
    const loc = useLocation();

    const [tabIndex, setTabIndex] = useState(
        () => tabs.findIndex(t => t.path === loc.pathname) || 2
    );
    const [items, setItems] = useState<Appointment[]>([]);
    const [filters, setFilters] = useState({
        date: "",
        status: "",
        client: "",
        master: "",
    });

    useEffect(() => {
        if (!token) return;
        fetch(`${import.meta.env.VITE_API_URL}/appointments`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => {
                if (res.status === 401) {
                    logout();
                    navigate("/signin", { replace: true });
                    return Promise.reject("Unauthorized");
                }
                if (!res.ok) return Promise.reject(`Error ${res.status}`);
                return res.json() as Promise<Appointment[]>;
            })
            .then(data => setItems(data))
            .catch(() => setItems([]));
    }, [token]);

    const handleTab = (_: React.SyntheticEvent, idx: number) => {
        setTabIndex(idx);
        navigate(tabs[idx].path);
    };

    const handleTextFilter = (field: keyof typeof filters) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFilters(f => ({ ...f, [field]: e.target.value }));
    };

    const handleSelectFilter = (field: keyof typeof filters) => (
        e: SelectChangeEvent
    ) => {
        setFilters(f => ({ ...f, [field]: e.target.value }));
    };

    const handleReset = () => {
        setFilters({ date: "", status: "", client: "", master: "" });
    };

    const filtered = items.filter(a =>
        (!filters.date || a.date === filters.date) &&
        (!filters.status || a.status === filters.status) &&
        (!filters.client || a.clientName.toLowerCase().includes(filters.client.toLowerCase())) &&
        (!filters.master || a.barberName.toLowerCase().includes(filters.master.toLowerCase()))
    );

    return (
        <Box>
            <Tabs value={tabIndex} onChange={handleTab} sx={{ mb: 3 }}>
                {tabs.map(t => <Tab key={t.path} label={t.label} />)}
            </Tabs>

            <Typography variant="h5" gutterBottom>Записи</Typography>

            <Paper sx={{ p: 2, mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
                <TextField
                    label="Дата"
                    type="date"
                    value={filters.date}
                    onChange={handleTextFilter("date")}
                    InputLabelProps={{ shrink: true }}
                />

                <Select
                    displayEmpty
                    value={filters.status}
                    onChange={handleSelectFilter("status")}
                    sx={{ minWidth: 140 }}
                >
                    <MenuItem value=""><em>Все статусы</em></MenuItem>
                    <MenuItem value="new">Новая</MenuItem>
                    <MenuItem value="confirmed">Подтверждена</MenuItem>
                    <MenuItem value="done">Выполнена</MenuItem>
                    <MenuItem value="canceled">Отменена</MenuItem>
                </Select>

                <TextField
                    label="Клиент"
                    placeholder="Имя клиента"
                    value={filters.client}
                    onChange={handleTextFilter("client")}
                />

                <TextField
                    label="Мастер"
                    placeholder="Имя мастера"
                    value={filters.master}
                    onChange={handleTextFilter("master")}
                />

                <IconButton onClick={handleReset} title="Сброс">
                    <RefreshIcon />
                </IconButton>
            </Paper>

            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Дата</TableCell>
                            <TableCell>Время</TableCell>
                            <TableCell>Клиент</TableCell>
                            <TableCell>Услуга</TableCell>
                            <TableCell>Мастер</TableCell>
                            <TableCell>Статус</TableCell>
                            <TableCell align="center">Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.length ? (
                            filtered.map(a => (
                                <TableRow key={a.id} hover>
                                    <TableCell>{a.date}</TableCell>
                                    <TableCell>{a.time}</TableCell>
                                    <TableCell>{a.clientName}</TableCell>
                                    <TableCell>{a.serviceName}</TableCell>
                                    <TableCell>{a.barberName}</TableCell>
                                    <TableCell>{a.status}</TableCell>
                                    <TableCell align="center">
                                        <IconButton size="small"><EditIcon fontSize="small" /></IconButton>
                                        <IconButton size="small" color="error"><DeleteIcon fontSize="small" /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                    Нет записей
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}