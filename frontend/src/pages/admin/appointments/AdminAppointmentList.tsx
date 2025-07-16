import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TableSortLabel,
    Pagination,
    Box,
    CircularProgress,
    Alert,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { Appointment, AppointmentStatus } from '../../../types';
import { adminAppointmentApi } from '../../../api/admin/appointments';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { useDebounce } from 'use-debounce';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

type SortField = 'id' | 'date' | 'createdAt' | 'status';
type SortDirection = 'asc' | 'desc';

const statusOptions: AppointmentStatus[] = [
    AppointmentStatus.NEW,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.DONE,
    AppointmentStatus.CANCELED
];

const AdminAppointmentList: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user: currentUser } = useAuth();

    const [sortField, setSortField] = useState<SortField>('id');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 10;
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch] = useDebounce(searchInput, 500);
    const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const searchInputRef = useRef<HTMLInputElement>(null);
    const isMountedRef = useRef(true);

    const fetchAppointments = async () => {
        if (!currentUser || currentUser.role !== 'ADMIN') return;

        try {
            setLoading(true);
            const response = await adminAppointmentApi.getAll({
                page,
                limit: itemsPerPage,
                search: debouncedSearch,
                sortBy: sortField,
                sortOrder: sortDirection,
                status: statusFilter !== 'all' ? statusFilter : undefined
            });

            if (isMountedRef.current) {
                setAppointments(response.data);
                setTotalPages(response.totalPages);
                if (searchInputRef.current) searchInputRef.current.focus();
            }
        } catch (error) {
            if (isMountedRef.current) {
                console.error('Ошибка загрузки записей:', error);
                setError('Не удалось загрузить список записей');
                setAppointments([]);
            }
        } finally {
            if (isMountedRef.current) setLoading(false);
        }
    };

    useEffect(() => {
        isMountedRef.current = true;
        fetchAppointments();

        return () => { isMountedRef.current = false; };
    }, [currentUser, debouncedSearch, page, sortField, sortDirection, statusFilter]);

    const handleSort = (field: SortField) => {
        const isAsc = sortField === field && sortDirection === 'asc';
        setSortDirection(isAsc ? 'desc' : 'asc');
        setSortField(field);
        setPage(1);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
            try {
                setDeletingId(id);
                await adminAppointmentApi.delete(id);

                if (appointments.length === 1 && page > 1) setPage(page - 1);
                else await fetchAppointments();

                if (searchInputRef.current) searchInputRef.current.focus();
            } catch (error) {
                console.error('Ошибка удаления записи:', error);
                setError('Не удалось удалить запись');
            } finally {
                setDeletingId(null);
            }
        }
    };

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => setPage(value);
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
        setPage(1);
    };
    const handleStatusFilterChange = (e: any) => {
        setStatusFilter(e.target.value);
        setPage(1);
    };

    if (loading) return <LoadingSpinner />;
    if (!currentUser || currentUser.role !== 'ADMIN') return null;

    return (
        <div>
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <TextField
                    inputRef={searchInputRef}
                    label="Поиск по клиенту, услуге или барберу"
                    variant="outlined"
                    size="small"
                    value={searchInput}
                    onChange={handleSearchChange}
                    placeholder="Введите для поиска..."
                    sx={{ width: 400 }}
                    autoFocus
                />

                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Фильтр по статусу</InputLabel>
                    <Select
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                        label="Фильтр по статусу"
                    >
                        <MenuItem value="all">Все статусы</MenuItem>
                        {statusOptions.map(status => (
                            <MenuItem key={status} value={status}>{status}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button
                    component={Link}
                    to="/admin/appointments/new"
                    variant="contained"
                >
                    Создать запись
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sortDirection={sortField === 'id' ? sortDirection : false}>
                                <TableSortLabel
                                    active={sortField === 'id'}
                                    direction={sortField === 'id' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('id')}
                                >
                                    ID
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Клиент</TableCell>
                            <TableCell>Услуга</TableCell>
                            <TableCell>Барбер</TableCell>
                            <TableCell>Барбершоп</TableCell>
                            <TableCell sortDirection={sortField === 'date' ? sortDirection : false}>
                                <TableSortLabel
                                    active={sortField === 'date'}
                                    direction={sortField === 'date' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('date')}
                                >
                                    Дата и время
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sortDirection={sortField === 'status' ? sortDirection : false}>
                                <TableSortLabel
                                    active={sortField === 'status'}
                                    direction={sortField === 'status' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('status')}
                                >
                                    Статус
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Создано</TableCell>
                            <TableCell>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {appointments.length > 0 ? appointments.map((appointment) => (
                            <TableRow key={appointment.id}>
                                <TableCell>{appointment.id}</TableCell>
                                <TableCell>{appointment.user?.name}</TableCell>
                                <TableCell>{appointment.service.name}</TableCell>
                                <TableCell>{appointment.barber.name}</TableCell>
                                <TableCell>{appointment.barber.barbershop?.name}</TableCell>
                                <TableCell>
                                    {format(new Date(appointment.date), 'dd.MM.yyyy')}, {appointment.startTime}
                                </TableCell>
                                <TableCell>{appointment.status}</TableCell>
                                <TableCell>
                                    {format(new Date(appointment.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        component={Link}
                                        to={`/admin/appointments/${appointment.id}`}
                                        size="small"
                                        sx={{ mr: 1 }}
                                    >
                                        Редактировать
                                    </Button>
                                    <Button
                                        onClick={() => handleDelete(appointment.id)}
                                        color="error"
                                        size="small"
                                        disabled={deletingId === appointment.id}
                                    >
                                        {deletingId === appointment.id ? <CircularProgress size={24} /> : 'Удалить'}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    {debouncedSearch || statusFilter !== 'all'
                                        ? "По вашему запросу ничего не найдено"
                                        : "Записи не найдены"}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                    />
                </Box>
            )}
        </div>
    );
};

export default AdminAppointmentList;