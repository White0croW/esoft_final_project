import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
    MenuItem,
    Tooltip,
    IconButton,
    Typography
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Refresh as RefreshIcon,
    Clear as ClearIcon,
    Check as CheckIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { keyframes } from '@mui/system';
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

// Анимации
const highlightAnimation = keyframes`
  0% { 
    background-color: rgba(110, 231, 183, 0.8);
    box-shadow: 0 0 10px rgba(110, 231, 183, 0.8);
  }
  70% { 
    background-color: rgba(110, 231, 183, 0.3);
    box-shadow: 0 0 5px rgba(110, 231, 183, 0.5);
  }
  100% { 
    background-color: transparent;
    box-shadow: none;
  }
`;

const fadeOutAnimation = keyframes`
  0% { opacity: 1; transform: scaleY(1); height: auto; }
  70% { background-color: rgba(254, 226, 226, 0.7); }
  100% { opacity: 0; transform: scaleY(0); height: 0; padding: 0; margin: 0; }
`;

const AdminAppointmentList: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState('');
    const { user: currentUser } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const location = useLocation();
    const navigate = useNavigate();

    const [sortField, setSortField] = useState<SortField>('id');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch] = useDebounce(searchInput, 500);
    const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [removingIds, setRemovingIds] = useState<number[]>([]);
    const [highlightedId, setHighlightedId] = useState<number | null>(null);

    const searchInputRef = useRef<HTMLInputElement>(null);
    const isMountedRef = useRef(true);

    // Обработка подсвеченных элементов из URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const highlightedIdParam = params.get('highlight');

        if (highlightedIdParam) {
            const id = parseInt(highlightedIdParam);
            if (!isNaN(id)) {
                setHighlightedId(id);
                const newParams = new URLSearchParams(params);
                newParams.delete('highlight');
                navigate({ search: newParams.toString() }, { replace: true });

                // Прокрутка к элементу с задержкой для гарантии рендеринга
                setTimeout(() => {
                    const element = document.getElementById(`appointment-${id}`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Добавляем дополнительную анимацию
                        element.animate(
                            [{ boxShadow: '0 0 8px rgba(110, 231, 183, 0.8)' },
                            { boxShadow: '0 0 0 rgba(110, 231, 183, 0)' }],
                            { duration: 3000 }
                        );
                    }
                }, 300);

                // Убираем подсветку через 5 секунд
                const timer = setTimeout(() => {
                    setHighlightedId(null);
                }, 5000);

                return () => clearTimeout(timer);
            }
        }
    }, [location.search, navigate]);

    const fetchAppointments = async () => {
        if (!currentUser || currentUser.role !== 'ADMIN') return;

        // Сбрасываем подсветку при загрузке новых данных
        if (isMountedRef.current && highlightedId) {
            setHighlightedId(null);
        }

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
                setTotalItems(response.total);
                setError('');
            }
        } catch (error) {
            if (isMountedRef.current) {
                setError('Не удалось загрузить список записей');
                enqueueSnackbar('Не удалось загрузить список записей', {
                    variant: 'error',
                    autoHideDuration: 3000
                });
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
                if (initialLoading) setInitialLoading(false);
            }
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
                setRemovingIds(prev => [...prev, id]);

                await adminAppointmentApi.delete(id);

                enqueueSnackbar('Запись успешно удалена', {
                    variant: 'success',
                    autoHideDuration: 2000
                });

                setTimeout(async () => {
                    await fetchAppointments();
                    setRemovingIds(prev => prev.filter(item => item !== id));

                    if (appointments.length === 1 && page > 1) {
                        setPage(prevPage => prevPage - 1);
                    }
                }, 700);

                searchInputRef.current?.focus();
            } catch (error) {
                setRemovingIds(prev => prev.filter(item => item !== id));
                enqueueSnackbar('Не удалось удалить запись', {
                    variant: 'error',
                    autoHideDuration: 3000
                });
            } finally {
                setDeletingId(null);
            }
        }
    };

    const handleRefresh = async () => {
        setHighlightedId(null);
        setPage(1); // Сбрасываем на первую страницу, чтобы увидеть новые записи
        await fetchAppointments();
        enqueueSnackbar('Данные обновлены', {
            variant: 'info',
            autoHideDuration: 1500
        });
    };

    const handleClearSearch = () => {
        setSearchInput('');
        searchInputRef.current?.focus();
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

    if (initialLoading) return <LoadingSpinner />;
    if (!currentUser || currentUser.role !== 'ADMIN') return null;

    return (
        <Box sx={{ p: 3, backgroundColor: '#f9fafb', minHeight: '100vh' }}>
            <Box sx={{ mb: 4 }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                    backgroundColor: 'white',
                    borderRadius: 2,
                    p: 3,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                }}>
                    <Box>
                        <Typography variant="h4" component="h1" sx={{
                            fontWeight: 700,
                            color: '#2d3748',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}>
                            Управление записями
                            <Tooltip title="Обновить данные">
                                <IconButton
                                    color="primary"
                                    onClick={handleRefresh}
                                    sx={{ ml: 1 }}
                                >
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#718096', mt: 1 }}>
                            Всего записей: {totalItems}
                        </Typography>
                    </Box>

                    <Button
                        component={Link}
                        to="/admin/appointments/new"
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{
                            bgcolor: '#4f46e5',
                            '&:hover': { bgcolor: '#4338ca' },
                            height: 45,
                            px: 3,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: '0 4px 6px rgba(79, 70, 229, 0.3)'
                        }}
                    >
                        Новая запись
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                    backgroundColor: 'white',
                    borderRadius: 2,
                    p: 2,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                }}>
                    <TextField
                        inputRef={searchInputRef}
                        label="Поиск по клиенту, услуге или барберу"
                        variant="outlined"
                        size="small"
                        value={searchInput}
                        onChange={handleSearchChange}
                        placeholder="Введите для поиска..."
                        sx={{
                            width: 400,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                paddingRight: 1
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <SearchIcon sx={{ color: '#a0aec0', mr: 1 }} />
                            ),
                            endAdornment: searchInput && (
                                <IconButton
                                    size="small"
                                    onClick={handleClearSearch}
                                    sx={{ color: '#a0aec0' }}
                                >
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            )
                        }}
                    />

                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Фильтр по статусу</InputLabel>
                        <Select
                            value={statusFilter}
                            onChange={handleStatusFilterChange}
                            label="Фильтр по статусу"
                            size="small"
                        >
                            <MenuItem value="all">Все статусы</MenuItem>
                            {statusOptions.map(status => (
                                <MenuItem key={status} value={status}>{status}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant="body2" sx={{ color: '#718096', alignSelf: 'center' }}>
                            Страница {page} из {totalPages}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <TableContainer
                component={Paper}
                sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    mb: 3,
                    position: 'relative',
                    minHeight: 400
                }}
            >
                {loading && (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        zIndex: 10
                    }}>
                        <CircularProgress size={60} thickness={4} sx={{ color: '#4f46e5' }} />
                    </Box>
                )}

                <Table>
                    <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, color: '#2d3748' }}>
                                <TableSortLabel
                                    active={sortField === 'id'}
                                    direction={sortField === 'id' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('id')}
                                >
                                    ID
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#2d3748' }}>Клиент</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#2d3748' }}>Услуга</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#2d3748' }}>Барбер</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#2d3748' }}>Барбершоп</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#2d3748' }}>
                                <TableSortLabel
                                    active={sortField === 'date'}
                                    direction={sortField === 'date' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('date')}
                                >
                                    Дата и время
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#2d3748' }}>
                                <TableSortLabel
                                    active={sortField === 'status'}
                                    direction={sortField === 'status' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('status')}
                                >
                                    Статус
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#2d3748' }}>
                                <TableSortLabel
                                    active={sortField === 'createdAt'}
                                    direction={sortField === 'createdAt' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('createdAt')}
                                >
                                    Создано
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#2d3748', width: 150 }}>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {appointments.length > 0 ? appointments.map((appointment) => {
                            const isHighlighted = highlightedId === appointment.id;
                            const isRemoving = removingIds.includes(appointment.id);

                            return (
                                <TableRow
                                    key={appointment.id}
                                    id={`appointment-${appointment.id}`}
                                    sx={{
                                        '&:nth-of-type(even)': { bgcolor: '#f8fafc' },
                                        '&:hover': { bgcolor: '#f1f5f9' },
                                        ...(isHighlighted && {
                                            animation: `${highlightAnimation} 2s ease`,
                                            boxShadow: '0 0 8px rgba(110, 231, 183, 0.5)'
                                        }),
                                        ...(isRemoving && {
                                            animation: `${fadeOutAnimation} 0.7s forwards`,
                                            transformOrigin: 'top'
                                        })
                                    }}
                                >
                                    <TableCell sx={{ fontWeight: 500, position: 'relative' }}>
                                        {appointment.id}
                                        {isHighlighted && (
                                            <CheckIcon sx={{
                                                color: 'green',
                                                ml: 1,
                                                verticalAlign: 'middle',
                                                fontSize: '1rem',
                                                position: 'absolute',
                                                top: '50%',
                                                transform: 'translateY(-50%)'
                                            }} />
                                        )}
                                    </TableCell>
                                    <TableCell>{appointment.user?.name || '-'}</TableCell>
                                    <TableCell>{appointment.service.name}</TableCell>
                                    <TableCell>{appointment.barber.name}</TableCell>
                                    <TableCell>{appointment.barber.barbershop?.name || '-'}</TableCell>
                                    <TableCell>
                                        {format(new Date(appointment.date), 'dd.MM.yyyy')}, {appointment.startTime}
                                    </TableCell>
                                    <TableCell>{appointment.status}</TableCell>
                                    <TableCell>
                                        {format(new Date(appointment.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })}
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Tooltip title="Редактировать" arrow>
                                                <IconButton
                                                    component={Link}
                                                    to={`/admin/appointments/${appointment.id}`}
                                                    size="small"
                                                    color="primary"
                                                    sx={{
                                                        bgcolor: '#e0f2fe',
                                                        '&:hover': { bgcolor: '#bae6fd' }
                                                    }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Удалить" arrow>
                                                <IconButton
                                                    onClick={() => handleDelete(appointment.id)}
                                                    size="small"
                                                    color="error"
                                                    disabled={deletingId === appointment.id}
                                                    sx={{
                                                        bgcolor: '#fee2e2',
                                                        '&:hover': { bgcolor: '#fecaca' },
                                                        '&:disabled': { bgcolor: '#f3f4f6' }
                                                    }}
                                                >
                                                    {deletingId === appointment.id ? (
                                                        <CircularProgress size={20} color="error" />
                                                    ) : (
                                                        <DeleteIcon fontSize="small" />
                                                    )}
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            );
                        }) : (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                                    <Box sx={{ textAlign: 'center', color: '#718096' }}>
                                        <SearchIcon sx={{ fontSize: 60, mb: 2, color: '#cbd5e0' }} />
                                        <Typography variant="h6" sx={{ mb: 1 }}>
                                            {debouncedSearch || statusFilter !== 'all'
                                                ? "Записи не найдены"
                                                : "Список записей пуст"}
                                        </Typography>
                                        <Typography variant="body1" sx={{ mb: 3 }}>
                                            {debouncedSearch
                                                ? "Попробуйте изменить условия поиска"
                                                : "Создайте первую запись"}
                                        </Typography>
                                        <Button
                                            component={Link}
                                            to="/admin/appointments/new"
                                            variant="contained"
                                            startIcon={<AddIcon />}
                                            sx={{
                                                bgcolor: '#4f46e5',
                                                '&:hover': { bgcolor: '#4338ca' },
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                fontWeight: 600
                                            }}
                                        >
                                            Создать запись
                                        </Button>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {totalPages > 1 && (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mt: 3,
                    backgroundColor: 'white',
                    borderRadius: 2,
                    p: 2,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        shape="rounded"
                        size="large"
                        sx={{
                            '& .MuiPaginationItem-root': {
                                fontWeight: 600,
                                borderRadius: 1.5
                            },
                            '& .Mui-selected': {
                                bgcolor: '#4f46e5',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: '#4338ca'
                                }
                            }
                        }}
                    />
                </Box>
            )}
        </Box>
    );
};

export default AdminAppointmentList;