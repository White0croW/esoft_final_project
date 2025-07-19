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
    TextField,
    Tooltip,
    IconButton,
    Typography,
    Alert,
    Grid
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Refresh as RefreshIcon,
    Clear as ClearIcon,
    Check as CheckIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { keyframes } from '@mui/system';
import { Barber } from '../../../types';
import { adminBarberApi } from '../../../api/admin/barbers';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { useDebounce } from 'use-debounce';

// Анимации
const highlightAnimation = keyframes`
  0% { background-color: rgba(110, 231, 183, 0.8); }
  70% { background-color: rgba(110, 231, 183, 0.3); }
  100% { background-color: transparent; }
`;

const fadeOutAnimation = keyframes`
  0% { opacity: 1; transform: scaleY(1); height: auto; }
  70% { background-color: rgba(254, 226, 226, 0.7); }
  100% { opacity: 0; transform: scaleY(0); height: 0; padding: 0; margin: 0; }
`;

type SortField = 'id' | 'name' | 'specialization' | 'rating' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const AdminBarberList: React.FC = () => {
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [loading, setLoading] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true);
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
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [removingIds, setRemovingIds] = useState<number[]>([]);
    const [error, setError] = useState('');
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
                params.delete('highlight');
                navigate({ search: params.toString() }, { replace: true });

                setTimeout(() => {
                    const element = document.getElementById(`barber-${id}`);
                    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 500);

                // Убираем подсветку через 5 секунд
                const timer = setTimeout(() => {
                    setHighlightedId(null);
                }, 5000);

                return () => clearTimeout(timer);
            }
        }
    }, [location.search, navigate]);

    const fetchBarbers = async () => {
        if (!currentUser || currentUser.role !== 'ADMIN') return;

        try {
            setLoading(true);
            const params = {
                page,
                limit: itemsPerPage,
                search: debouncedSearch,
                sortBy: sortField,
                sortOrder: sortDirection
            };

            const response = await adminBarberApi.getAll(params);

            if (isMountedRef.current) {
                setBarbers(response.data);
                setTotalPages(response.totalPages);
                setTotalItems(response.total);
                setError('');
            }
        } catch (error: any) {
            if (isMountedRef.current) {
                const errorMessage = error.response?.data?.error ||
                    'Не удалось загрузить список мастеров';
                setError(errorMessage);
                enqueueSnackbar(errorMessage, {
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
        fetchBarbers();

        return () => { isMountedRef.current = false; };
    }, [currentUser, page, debouncedSearch, sortField, sortDirection]);

    const handleSort = (field: SortField) => {
        const isAsc = sortField === field && sortDirection === 'asc';
        setSortDirection(isAsc ? 'desc' : 'asc');
        setSortField(field);
        setPage(1);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Вы уверены, что хотите удалить этого мастера?')) {
            try {
                setDeletingId(id);
                setRemovingIds(prev => [...prev, id]);

                await adminBarberApi.delete(id);

                enqueueSnackbar('Мастер успешно удалён', {
                    variant: 'success',
                    autoHideDuration: 2000
                });

                setTimeout(async () => {
                    await fetchBarbers();
                    setRemovingIds(prev => prev.filter(item => item !== id));

                    if (barbers.length === 1 && page > 1) {
                        setPage(prevPage => prevPage - 1);
                    }
                }, 700);

                searchInputRef.current?.focus();
            } catch (error: any) {
                setRemovingIds(prev => prev.filter(item => item !== id));
                const errorMessage = error.response?.data?.error ||
                    'Не удалось удалить мастера';
                enqueueSnackbar(errorMessage, {
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
        await fetchBarbers();
        enqueueSnackbar('Данные обновлены', {
            variant: 'info',
            autoHideDuration: 1500
        });
    };

    const handleClearSearch = () => {
        setSearchInput('');
        searchInputRef.current?.focus();
    };

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
        setPage(1);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
                            Управление мастерами
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
                            Всего мастеров: {totalItems}
                        </Typography>
                    </Box>

                    <Button
                        component={Link}
                        to="/admin/barbers/new"
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
                        Добавить мастера
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
                        label="Поиск мастеров"
                        variant="outlined"
                        size="small"
                        value={searchInput}
                        onChange={handleSearchChange}
                        placeholder="Введите имя, специализацию или ID..."
                        sx={{
                            width: 350,
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
                {loading && !initialLoading && (
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
                            <TableCell sx={{ fontWeight: 700, color: '#2d3748' }}>
                                <TableSortLabel
                                    active={sortField === 'name'}
                                    direction={sortField === 'name' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('name')}
                                >
                                    Имя
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#2d3748' }}>
                                <TableSortLabel
                                    active={sortField === 'specialization'}
                                    direction={sortField === 'specialization' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('specialization')}
                                >
                                    Специализация
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#2d3748' }}>
                                <TableSortLabel
                                    active={sortField === 'rating'}
                                    direction={sortField === 'rating' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('rating')}
                                >
                                    Рейтинг
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#2d3748' }}>
                                Барбершоп
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#2d3748' }}>
                                <TableSortLabel
                                    active={sortField === 'createdAt'}
                                    direction={sortField === 'createdAt' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('createdAt')}
                                >
                                    Дата создания
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#2d3748', width: 150 }}>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {barbers.length > 0 ? barbers.map((barber) => {
                            const isHighlighted = highlightedId === barber.id;
                            const isRemoving = removingIds.includes(barber.id);

                            return (
                                <TableRow
                                    key={barber.id}
                                    id={`barber-${barber.id}`}
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
                                    <TableCell sx={{ fontWeight: 500 }}>
                                        {barber.id}
                                        {isHighlighted && (
                                            <CheckIcon sx={{
                                                color: 'green',
                                                ml: 1,
                                                verticalAlign: 'middle',
                                                fontSize: '1rem'
                                            }} />
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <PersonIcon fontSize="small" color="action" />
                                            {barber.name}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{barber.specialization || '-'}</TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            {barber.rating || 0}
                                            {barber.rating && barber.rating >= 4.5 && (
                                                <Box sx={{
                                                    bgcolor: 'gold',
                                                    color: 'darkgoldenrod',
                                                    px: 1,
                                                    py: 0.5,
                                                    borderRadius: 1,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold'
                                                }}>
                                                    ТОП
                                                </Box>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        {barber.barbershop ? (
                                            <Tooltip title={barber.barbershop.address}>
                                                <span>{barber.barbershop.name}</span>
                                            </Tooltip>
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell>{formatDate(barber.createdAt)}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Tooltip title="Редактировать" arrow>
                                                <IconButton
                                                    component={Link}
                                                    to={`/admin/barbers/${barber.id}`}
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
                                                    onClick={() => handleDelete(barber.id)}
                                                    size="small"
                                                    color="error"
                                                    disabled={deletingId === barber.id}
                                                    sx={{
                                                        bgcolor: '#fee2e2',
                                                        '&:hover': { bgcolor: '#fecaca' },
                                                        '&:disabled': { bgcolor: '#f3f4f6' }
                                                    }}
                                                >
                                                    {deletingId === barber.id ? (
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
                                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                    <Box sx={{ textAlign: 'center', color: '#718096' }}>
                                        <SearchIcon sx={{ fontSize: 60, mb: 2, color: '#cbd5e0' }} />
                                        <Typography variant="h6" sx={{ mb: 1 }}>
                                            {debouncedSearch ? "Мастера не найдены" : "Список мастеров пуст"}
                                        </Typography>
                                        <Typography variant="body1" sx={{ mb: 3 }}>
                                            {debouncedSearch
                                                ? "Попробуйте изменить условия поиска"
                                                : "Добавьте первого мастера"}
                                        </Typography>
                                        {!debouncedSearch && (
                                            <Button
                                                component={Link}
                                                to="/admin/barbers/new"
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
                                                Добавить мастера
                                            </Button>
                                        )}
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

export default AdminBarberList;