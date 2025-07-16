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
import { Service } from '../../../types';
import { adminServiceApi } from '../../../api/admin/services';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { useDebounce } from 'use-debounce';

type SortField = 'id' | 'name' | 'price' | 'duration' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const AdminServiceList: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
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

    const searchInputRef = useRef<HTMLInputElement>(null);
    const isMountedRef = useRef(true);

    const fetchServices = async () => {
        if (!currentUser || currentUser.role !== 'ADMIN') return;

        try {
            setLoading(true);
            const response = await adminServiceApi.getAll({
                page,
                limit: itemsPerPage,
                search: debouncedSearch,
                sortBy: sortField,
                sortOrder: sortDirection
            });

            if (isMountedRef.current) {
                setServices(response.data);
                setTotalPages(response.totalPages);
                if (searchInputRef.current) searchInputRef.current.focus();
            }
        } catch (error) {
            if (isMountedRef.current) {
                console.error('Ошибка загрузки услуг:', error);
                setError('Не удалось загрузить список услуг');
                setServices([]);
            }
        } finally {
            if (isMountedRef.current) setLoading(false);
        }
    };

    useEffect(() => {
        isMountedRef.current = true;
        fetchServices();

        return () => { isMountedRef.current = false; };
    }, [currentUser, debouncedSearch, page, sortField, sortDirection]);

    const handleSort = (field: SortField) => {
        const isAsc = sortField === field && sortDirection === 'asc';
        setSortDirection(isAsc ? 'desc' : 'asc');
        setSortField(field);
        setPage(1);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Вы уверены, что хотите удалить эту услугу?')) {
            try {
                setDeletingId(id);
                await adminServiceApi.delete(id);

                if (services.length === 1 && page > 1) setPage(page - 1);
                else await fetchServices();

                if (searchInputRef.current) searchInputRef.current.focus();
            } catch (error) {
                console.error('Ошибка удаления услуги:', error);
                setError('Не удалось удалить услугу');
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

    if (loading) return <LoadingSpinner />;
    if (!currentUser || currentUser.role !== 'ADMIN') return null;

    return (
        <div>
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Button component={Link} to="/admin/services/new" variant="contained">
                    Добавить услугу
                </Button>

                <TextField
                    inputRef={searchInputRef}
                    label="Поиск по услугам"
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
                                    Название
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Описание</TableCell>
                            <TableCell sortDirection={sortField === 'duration' ? sortDirection : false}>
                                <TableSortLabel
                                    active={sortField === 'duration'}
                                    direction={sortField === 'duration' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('duration')}
                                >
                                    Длительность (мин)
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sortDirection={sortField === 'price' ? sortDirection : false}>
                                <TableSortLabel
                                    active={sortField === 'price'}
                                    direction={sortField === 'price' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('price')}
                                >
                                    Цена (₽)
                                </TableSortLabel>
                            </TableCell>
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
                        {services.length > 0 ? services.map((service) => (
                            <TableRow key={service.id}>
                                <TableCell>{service.id}</TableCell>
                                <TableCell>{service.name}</TableCell>
                                <TableCell>{service.description || '-'}</TableCell>
                                <TableCell>{service.duration}</TableCell>
                                <TableCell>{service.price}</TableCell>
                                <TableCell>{new Date(service.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Button
                                        component={Link}
                                        to={`/admin/services/${service.id}`}
                                        size="small"
                                        sx={{ mr: 1 }}
                                    >
                                        Редактировать
                                    </Button>
                                    <Button
                                        onClick={() => handleDelete(service.id)}
                                        color="error"
                                        size="small"
                                        disabled={deletingId === service.id}
                                    >
                                        {deletingId === service.id ? <CircularProgress size={24} /> : 'Удалить'}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    {debouncedSearch ? "По вашему запросу ничего не найдено" : "Услуги не найдены"}
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

export default AdminServiceList;