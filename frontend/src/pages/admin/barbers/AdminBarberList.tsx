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
    TextField
} from '@mui/material';
import { Barber } from '../../../types';
import { adminBarberApi } from '../../../api/admin/barbers';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { useDebounce } from 'use-debounce';

type SortField = 'id' | 'name' | 'specialization' | 'rating' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const AdminBarberList: React.FC = () => {
    const [barbers, setBarbers] = useState<Barber[]>([]);
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
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Реф для фокуса на поле поиска
    const searchInputRef = useRef<HTMLInputElement>(null);
    const isMountedRef = useRef(true);

    const fetchBarbers = async () => {
        if (!currentUser || currentUser.role !== 'ADMIN') return;

        try {
            setLoading(true);
            const response = await adminBarberApi.getAll({
                page,
                limit: itemsPerPage,
                search: debouncedSearch,
                sortBy: sortField,
                sortOrder: sortDirection
            });

            if (isMountedRef.current) {
                setBarbers(response.data);
                setTotalPages(response.totalPages);

                // Фокус на поле поиска после загрузки
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            }
        } catch (error) {
            if (isMountedRef.current) {
                console.error('Ошибка загрузки мастеров:', error);
                setError('Не удалось загрузить список мастеров');
                setBarbers([]);
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        isMountedRef.current = true;
        fetchBarbers();

        return () => {
            isMountedRef.current = false;
        };
    }, [currentUser, debouncedSearch, page, sortField, sortDirection]);

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
                await adminBarberApi.delete(id);

                // Переход на предыдущую страницу при удалении последнего элемента
                if (barbers.length === 1 && page > 1) {
                    setPage(page - 1);
                } else {
                    await fetchBarbers();
                }

                // Возврат фокуса на поиск
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            } catch (error) {
                console.error('Ошибка удаления мастера:', error);
                setError('Не удалось удалить мастера');
            } finally {
                setDeletingId(null);
            }
        }
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
        setPage(1);
    };

    if (loading) return <LoadingSpinner />;
    if (!currentUser || currentUser.role !== 'ADMIN') return null;

    return (
        <div>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Button
                    component={Link}
                    to="/admin/barbers/new"
                    variant="contained"
                >
                    Добавить мастера
                </Button>

                <TextField
                    inputRef={searchInputRef}
                    label="Поиск по всем полям"
                    variant="outlined"
                    size="small"
                    value={searchInput}
                    onChange={handleSearchChange}
                    placeholder="Введите для поиска..."
                    sx={{ width: 300 }}
                    autoFocus
                />
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
                            <TableCell sortDirection={sortField === 'name' ? sortDirection : false}>
                                <TableSortLabel
                                    active={sortField === 'name'}
                                    direction={sortField === 'name' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('name')}
                                >
                                    Имя
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sortDirection={sortField === 'specialization' ? sortDirection : false}>
                                <TableSortLabel
                                    active={sortField === 'specialization'}
                                    direction={sortField === 'specialization' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('specialization')}
                                >
                                    Специализация
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sortDirection={sortField === 'rating' ? sortDirection : false}>
                                <TableSortLabel
                                    active={sortField === 'rating'}
                                    direction={sortField === 'rating' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('rating')}
                                >
                                    Рейтинг
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Барбершоп</TableCell>
                            <TableCell sortDirection={sortField === 'createdAt' ? sortDirection : false}>
                                <TableSortLabel
                                    active={sortField === 'createdAt'}
                                    direction={sortField === 'createdAt' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('createdAt')}
                                >
                                    Дата создания
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {barbers.length > 0 ? (
                            barbers.map((barber) => (
                                <TableRow key={barber.id}>
                                    <TableCell>{barber.id}</TableCell>
                                    <TableCell>{barber.name}</TableCell>
                                    <TableCell>{barber.specialization || '-'}</TableCell>
                                    <TableCell>{barber.rating || 0}</TableCell>
                                    <TableCell>{barber.barbershop?.name || '-'}</TableCell>
                                    <TableCell>
                                        {new Date(barber.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            component={Link}
                                            to={`/admin/barbers/${barber.id}`}
                                            size="small"
                                            sx={{ mr: 1 }}
                                        >
                                            Редактировать
                                        </Button>
                                        <Button
                                            onClick={() => handleDelete(barber.id)}
                                            color="error"
                                            size="small"
                                            disabled={deletingId === barber.id}
                                        >
                                            {deletingId === barber.id
                                                ? <CircularProgress size={24} />
                                                : 'Удалить'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    {debouncedSearch ? "По вашему запросу ничего не найдено" : "Мастера не найдены"}
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

export default AdminBarberList;