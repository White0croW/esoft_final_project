import React, { useEffect, useState, useCallback } from "react";
import {
    Box, Button, Card, CardContent, CardHeader, TextField, Container, Typography,
    CircularProgress, Snackbar, Alert, Avatar, Tabs, Tab, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle,
    DialogContent, DialogActions, Grid, Chip, Divider, useTheme, TableSortLabel,
    TablePagination
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getProfile, updateProfile, changePassword, Profile } from "../api/profile";
import { getMyAppointments, updateAppointment, cancelAppointment, Appointment } from "../api/appointment";

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { getAvailableSlots, TimeSlot } from "../api/appointment";
import { Edit, Lock, Event, Schedule, Close, CheckCircle, Cancel, ArrowDownward, ArrowUpward } from "@mui/icons-material";

// Тип для сортировки
type Order = 'asc' | 'desc';

// Функция для стабильной сортировки
function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

// Компараторы для разных типов данных
function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key,
): (a: { [key in Key]: any }, b: { [key in Key]: any }) => number {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

// Интерфейс для заголовков таблицы
interface HeadCell {
    id: keyof Appointment;
    label: string;
    sortable: boolean;
    align?: 'left' | 'center' | 'right';
}

// Конфигурация колонок
const headCells: HeadCell[] = [
    { id: 'date', label: 'Дата и время', sortable: true },
    { id: 'service', label: 'Услуга', sortable: true },
    { id: 'barber', label: 'Барбер', sortable: true },
    { id: 'barbershop', label: 'Барбершоп', sortable: true },
    { id: 'status', label: 'Статус', sortable: true, align: 'center' },
    { id: 'actions', label: 'Действия', sortable: false, align: 'center' }
];

export default function ProfilePage() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const theme = useTheme();

    // Состояния для профиля
    const [data, setData] = useState<Profile>({ name: "", email: "", phone: "" });
    const [edit, setEdit] = useState(false);
    const [loading, setLoading] = useState(true);

    // Состояния для пароля
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    // Состояния для записей
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [appointmentsLoading, setAppointmentsLoading] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [cancelingAppointmentId, setCancelingAppointmentId] = useState<number | null>(null);

    // Пагинация и сортировка
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof Appointment>('date');

    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

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

    useEffect(() => {
        if (activeTab === 1) {
            loadAppointments();
        }
    }, [activeTab]);

    useEffect(() => {
        if (editingAppointment) {
            setSelectedDate(dayjs(editingAppointment.date));
            setSelectedTime(editingAppointment.startTime);
            fetchSlots(editingAppointment);
        }
    }, [editingAppointment]);

    const fetchSlots = async (appointment: Appointment) => {
        if (!selectedDate) return;

        setLoadingSlots(true);
        try {
            const slots = await getAvailableSlots(
                appointment.barber.id,
                appointment.service.id,
                selectedDate.format('YYYY-MM-DD')
            );
            setAvailableSlots(slots);
            if (!slots.some(slot => slot.start === appointment.startTime)) {
                setSelectedTime(null);
            }
        } catch {
            setAvailableSlots([]);
            setSelectedTime(null);
        } finally {
            setLoadingSlots(false);
        }
    };

    const loadAppointments = async () => {
        setAppointmentsLoading(true);
        try {
            const data = await getMyAppointments();
            setAppointments(data);
            // Сброс пагинации при загрузке новых данных
            setPage(0);
        } catch (err) {
            setSnackbar({
                open: true,
                message: 'Не удалось загрузить записи',
                severity: 'error'
            });
        } finally {
            setAppointmentsLoading(false);
        }
    };

    // Обработчик сортировки
    const handleRequestSort = (
        property: keyof Appointment,
    ) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // Обработчик смены страницы
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    // Обработчик изменения количества строк на странице
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Функция для создания обработчика сортировки
    const createSortHandler = (property: keyof Appointment) => () => {
        handleRequestSort(property);
    };

    // Рассчитываем количество пустых строк для заполнения таблицы
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - appointments.length) : 0;

    // Применяем сортировку и пагинацию к данным
    const sortedAppointments = stableSort(appointments, getComparator(order, orderBy));
    const paginatedAppointments = sortedAppointments.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

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
                message: "Профиль успешно обновлён",
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
                message: "Пароль успешно обновлён",
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

    const handleUpdateAppointment = async () => {
        if (!editingAppointment || !selectedDate || !selectedTime) return;

        try {
            const updated = await updateAppointment(editingAppointment.id, {
                date: selectedDate.format('YYYY-MM-DD'),
                startTime: selectedTime,
                barberId: editingAppointment.barber.id,
                serviceId: editingAppointment.service.id
            });

            setAppointments(prev =>
                prev.map(a => a.id === updated.id ? updated : a)
            );

            setEditingAppointment(null);
            setSnackbar({
                open: true,
                message: 'Запись успешно обновлена',
                severity: 'success'
            });
        } catch (err) {
            setSnackbar({
                open: true,
                message: 'Ошибка при обновлении записи',
                severity: 'error'
            });
        }
    };

    const handleCancelAppointment = async () => {
        if (!cancelingAppointmentId) return;

        try {
            await cancelAppointment(cancelingAppointmentId);
            setAppointments(prev =>
                prev.map(a => a.id === cancelingAppointmentId ? { ...a, status: 'CANCELED' } : a)
            );

            setCancelingAppointmentId(null);
            setSnackbar({
                open: true,
                message: 'Запись успешно отменена',
                severity: 'success'
            });
        } catch (err) {
            setSnackbar({
                open: true,
                message: 'Ошибка при отмене записи',
                severity: 'error'
            });
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress size={60} />
            </Box>
        );
    }

    const statusLabels: Record<string, { text: string, color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" }> = {
        'NEW': { text: 'Новая', color: 'info' },
        'CONFIRMED': { text: 'Подтверждена', color: 'primary' },
        'DONE': { text: 'Выполнена', color: 'success' },
        'CANCELED': { text: 'Отменена', color: 'error' }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
            <Box sx={{ bgcolor: 'background.paper', borderRadius: 4, boxShadow: 3, overflow: 'hidden' }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, newValue) => setActiveTab(newValue)}
                    variant="fullWidth"
                    sx={{
                        bgcolor: theme.palette.primary.main,
                        '& .MuiTabs-indicator': { height: 4 },
                        '& .MuiTab-root': {
                            color: theme.palette.primary.contrastText,
                            opacity: 0.8,
                            fontSize: '1rem',
                            py: 3,
                            fontWeight: 500
                        },
                        '& .Mui-selected': {
                            color: theme.palette.primary.contrastText,
                            opacity: 1,
                            fontWeight: 600
                        }
                    }}
                >
                    <Tab icon={<Edit sx={{ mb: 0.5 }} />} iconPosition="start" label="Профиль" />
                    <Tab icon={<Event sx={{ mb: 0.5 }} />} iconPosition="start" label="Мои записи" />
                    <Tab icon={<Lock sx={{ mb: 0.5 }} />} iconPosition="start" label="Смена пароля" />
                </Tabs>

                {activeTab === 0 && (
                    <Box sx={{ p: { xs: 2, md: 4 } }}>
                        <Grid container spacing={4}>
                            <Grid size={{ xs: 12, md: 5 }}>
                                <Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%' }}>
                                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                                        <Avatar sx={{
                                            width: 120,
                                            height: 120,
                                            fontSize: 50,
                                            mb: 3,
                                            bgcolor: theme.palette.primary.main
                                        }}>
                                            {data.name.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Typography variant="h5" fontWeight={600} gutterBottom>
                                            {data.name}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            {data.email}
                                        </Typography>
                                        {data.phone && (
                                            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                                                {data.phone}
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid size={{ xs: 12, md: 7 }}>
                                <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                                    <CardHeader
                                        title="Редактирование профиля"
                                        action={
                                            <Button
                                                variant={edit ? "outlined" : "contained"}
                                                onClick={() => setEdit(e => !e)}
                                                startIcon={edit ? <Close /> : <Edit />}
                                            >
                                                {edit ? "Отменить" : "Редактировать"}
                                            </Button>
                                        }
                                    />
                                    <CardContent>
                                        {edit ? (
                                            <Box display="grid" gap={3}>
                                                <TextField
                                                    label="Имя"
                                                    fullWidth
                                                    value={data.name}
                                                    onChange={(e) => setData(d => ({ ...d, name: e.target.value }))}
                                                    variant="outlined"
                                                    size="medium"
                                                />
                                                <TextField
                                                    label="Email"
                                                    type="email"
                                                    fullWidth
                                                    value={data.email}
                                                    onChange={(e) => setData(d => ({ ...d, email: e.target.value }))}
                                                    variant="outlined"
                                                    size="medium"
                                                />
                                                <TextField
                                                    label="Телефон"
                                                    fullWidth
                                                    value={data.phone ?? ""}
                                                    onChange={(e) => setData(d => ({ ...d, phone: e.target.value }))}
                                                    variant="outlined"
                                                    size="medium"
                                                />
                                                <Box display="flex" justifyContent="flex-end" mt={2}>
                                                    <Button
                                                        variant="contained"
                                                        onClick={saveProfile}
                                                        size="large"
                                                        sx={{ px: 4, py: 1.5 }}
                                                    >
                                                        Сохранить
                                                    </Button>
                                                </Box>
                                            </Box>
                                        ) : (
                                            <Box sx={{ p: 2 }}>
                                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                                    Информация о профиле
                                                </Typography>
                                                <Box display="grid" gap={2} mt={3}>
                                                    <Box>
                                                        <Typography variant="subtitle2" color="text.secondary">
                                                            Имя
                                                        </Typography>
                                                        <Typography variant="body1">{data.name}</Typography>
                                                    </Box>
                                                    <Divider />
                                                    <Box>
                                                        <Typography variant="subtitle2" color="text.secondary">
                                                            Email
                                                        </Typography>
                                                        <Typography variant="body1">{data.email}</Typography>
                                                    </Box>
                                                    <Divider />
                                                    {data.phone && (
                                                        <>
                                                            <Box>
                                                                <Typography variant="subtitle2" color="text.secondary">
                                                                    Телефон
                                                                </Typography>
                                                                <Typography variant="body1">{data.phone}</Typography>
                                                            </Box>
                                                            <Divider />
                                                        </>
                                                    )}
                                                </Box>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {activeTab === 1 && (
                    <Box sx={{ p: { xs: 2, md: 4 } }}>
                        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                            <CardHeader
                                title="Мои записи"
                                titleTypographyProps={{ variant: 'h5', fontWeight: 600 }}
                                sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
                            />
                            <CardContent>
                                {appointmentsLoading ? (
                                    <Box display="flex" justifyContent="center" py={4}>
                                        <CircularProgress size={50} />
                                    </Box>
                                ) : appointments.length === 0 ? (
                                    <Box textAlign="center" py={4}>
                                        <Event sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                                        <Typography variant="h6" color="text.secondary">
                                            У вас нет активных записей
                                        </Typography>
                                        <Button variant="outlined" sx={{ mt: 3 }} onClick={() => navigate('/')}>
                                            Найти барбера
                                        </Button>
                                    </Box>
                                ) : (
                                    <>
                                        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none' }}>
                                            <Table>
                                                <TableHead sx={{ bgcolor: theme.palette.background.default }}>
                                                    <TableRow>
                                                        {headCells.map((headCell) => (
                                                            <TableCell
                                                                key={headCell.id}
                                                                align={headCell.align || 'left'}
                                                                sortDirection={orderBy === headCell.id ? order : false}
                                                            >
                                                                {headCell.sortable ? (
                                                                    <TableSortLabel
                                                                        active={orderBy === headCell.id}
                                                                        direction={orderBy === headCell.id ? order : 'asc'}
                                                                        onClick={createSortHandler(headCell.id)}
                                                                    >
                                                                        {headCell.label}
                                                                        {orderBy === headCell.id ? (
                                                                            <Box component="span" sx={{ display: 'none' }}>
                                                                                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                                                            </Box>
                                                                        ) : null}
                                                                    </TableSortLabel>
                                                                ) : (
                                                                    headCell.label
                                                                )}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {paginatedAppointments.map((appointment) => (
                                                        <TableRow key={appointment.id} hover>
                                                            <TableCell>
                                                                <Box display="flex" alignItems="center" gap={1}>
                                                                    <Event fontSize="small" color="action" />
                                                                    <span>
                                                                        {new Date(appointment.date).toLocaleDateString()}
                                                                        <Box component="span" fontWeight={600} ml={1}>
                                                                            {appointment.startTime}
                                                                        </Box>
                                                                    </span>
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>{appointment.service.name}</TableCell>
                                                            <TableCell>{appointment.barber.name}</TableCell>
                                                            <TableCell>{appointment.barbershop.name}</TableCell>
                                                            <TableCell align="center">
                                                                <Chip
                                                                    label={statusLabels[appointment.status].text}
                                                                    color={statusLabels[appointment.status].color}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                {['NEW', 'CONFIRMED'].includes(appointment.status) && (
                                                                    <Button
                                                                        size="small"
                                                                        variant="outlined"
                                                                        color="error"
                                                                        onClick={() => setCancelingAppointmentId(appointment.id)}
                                                                        startIcon={<Cancel fontSize="small" />}
                                                                    >
                                                                        Отменить
                                                                    </Button>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                    {emptyRows > 0 && (
                                                        <TableRow style={{ height: 53 * emptyRows }}>
                                                            <TableCell colSpan={6} />
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                        <TablePagination
                                            rowsPerPageOptions={[5, 10, 25]}
                                            component="div"
                                            count={appointments.length}
                                            rowsPerPage={rowsPerPage}
                                            page={page}
                                            onPageChange={handleChangePage}
                                            onRowsPerPageChange={handleChangeRowsPerPage}
                                            labelRowsPerPage="Строк на странице:"
                                            labelDisplayedRows={({ from, to, count }) =>
                                                `${from}-${to} из ${count !== -1 ? count : `больше чем ${to}`}`
                                            }
                                            sx={{
                                                borderTop: `1px solid ${theme.palette.divider}`,
                                                mt: -1 // Убираем двойной отступ
                                            }}
                                        />
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </Box>
                )}

                {activeTab === 2 && (
                    <Box sx={{ p: { xs: 2, md: 4 } }}>
                        <Card sx={{ borderRadius: 3, boxShadow: 3, maxWidth: 600, mx: 'auto' }}>
                            <CardHeader
                                title="Смена пароля"
                                titleTypographyProps={{ variant: 'h5', fontWeight: 600 }}
                                sx={{
                                    bgcolor: theme.palette.primary.main,
                                    color: theme.palette.primary.contrastText,
                                    borderTopLeftRadius: 12,
                                    borderTopRightRadius: 12
                                }}
                            />
                            <CardContent sx={{ py: 4 }}>
                                <Box display="grid" gap={3}>
                                    <TextField
                                        label="Старый пароль"
                                        type="password"
                                        fullWidth
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        variant="outlined"
                                        size="medium"
                                        InputProps={{
                                            startAdornment: <Lock sx={{ color: 'action.active', mr: 1 }} />
                                        }}
                                    />
                                    <TextField
                                        label="Новый пароль"
                                        type="password"
                                        fullWidth
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        variant="outlined"
                                        size="medium"
                                        InputProps={{
                                            startAdornment: <Lock sx={{ color: 'action.active', mr: 1 }} />
                                        }}
                                    />
                                    <TextField
                                        label="Повторите пароль"
                                        type="password"
                                        fullWidth
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        variant="outlined"
                                        size="medium"
                                        InputProps={{
                                            startAdornment: <Lock sx={{ color: 'action.active', mr: 1 }} />
                                        }}
                                    />
                                    <Box display="flex" justifyContent="flex-end" mt={2}>
                                        <Button
                                            variant="contained"
                                            onClick={submitPassword}
                                            size="large"
                                            sx={{ px: 4, py: 1.5 }}
                                        >
                                            Обновить пароль
                                        </Button>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                )}
            </Box>

            {/* Диалог подтверждения отмены */}
            <Dialog
                open={!!cancelingAppointmentId}
                onClose={() => setCancelingAppointmentId(null)}
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ fontWeight: 600, bgcolor: theme.palette.background.default }}>
                    Подтверждение отмены
                </DialogTitle>
                <DialogContent sx={{ py: 3 }}>
                    <Box textAlign="center" py={2}>
                        <Cancel sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
                        <Typography variant="h6">
                            Вы уверены что хотите отменить запись?
                        </Typography>
                        <Typography color="text.secondary" sx={{ mt: 1 }}>
                            Это действие нельзя отменить
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: theme.palette.background.default }}>
                    <Button
                        onClick={() => setCancelingAppointmentId(null)}
                        variant="outlined"
                        sx={{ borderRadius: 2, px: 3, py: 1 }}
                    >
                        Нет, оставить
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleCancelAppointment}
                        sx={{ borderRadius: 2, px: 3, py: 1 }}
                    >
                        Да, отменить
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                    sx={{
                        borderRadius: 2,
                        boxShadow: 3,
                        alignItems: 'center',
                        minWidth: 300
                    }}
                    iconMapping={{
                        success: <CheckCircle fontSize="large" />,
                        error: <Cancel fontSize="large" />
                    }}
                >
                    <Typography fontWeight={600}>{snackbar.message}</Typography>
                </Alert>
            </Snackbar>
        </Container>
    );
}