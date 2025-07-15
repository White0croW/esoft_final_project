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
import { BarberShop } from '../../../types';
import api from '../../../api/base';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { useDebounce } from 'use-debounce';

type SortField = 'id' | 'name' | 'address' | 'lat' | 'lon' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const AdminBarbershopList: React.FC = () => {
    const [barbershops, setBarbershops] = useState<BarberShop[]>([]);
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

    // Реф для сохранения фокуса на поле поиска
    const searchInputRef = useRef<HTMLInputElement>(null);

    const isMountedRef = useRef(true);

    const fetchBarbershops = async () => {
        if (!currentUser || currentUser.role !== 'ADMIN') return;

        try {
            setLoading(true);
            const response = await api.get(`/admin/barbershops`, {
                params: {
                    search: debouncedSearch,
                    page,
                    limit: itemsPerPage,
                    sortBy: sortField,
                    sortOrder: sortDirection
                }
            });

            if (isMountedRef.current) {
                setBarbershops(response.data.data);
                setTotalPages(response.data.totalPages);

                // Возвращаем фокус на поле поиска после загрузки
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки барбершопов:', error);
            if (isMountedRef.current) {
                setError('Не удалось загрузить список барбершопов');
                setBarbershops([]);
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        isMountedRef.current = true;
        fetchBarbershops();

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
        if (window.confirm('Вы уверены, что хотите удалить этот барбершоп?')) {
            try {
                setDeletingId(id);
                await api.delete(`/admin/barbershops/${id}`);

                await fetchBarbershops();

                if (barbershops.length === 1 && page > 1) {
                    setPage(page - 1);
                }

                // Возвращаем фокус на поле поиска после удаления
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            } catch (error) {
                console.error('Ошибка удаления барбершопа:', error);
                setError('Не удалось удалить барбершоп');
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
                    to="/admin/barbershops/new"
                    variant="contained"
                >
                    Добавить барбершоп
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
                                    Название
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sortDirection={sortField === 'address' ? sortDirection : false}>
                                <TableSortLabel
                                    active={sortField === 'address'}
                                    direction={sortField === 'address' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('address')}
                                >
                                    Адрес
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sortDirection={sortField === 'lat' ? sortDirection : false}>
                                <TableSortLabel
                                    active={sortField === 'lat'}
                                    direction={sortField === 'lat' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('lat')}
                                >
                                    Широта
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sortDirection={sortField === 'lon' ? sortDirection : false}>
                                <TableSortLabel
                                    active={sortField === 'lon'}
                                    direction={sortField === 'lon' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('lon')}
                                >
                                    Долгота
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
                        {barbershops.length > 0 ? (
                            barbershops.map((barbershop) => (
                                <TableRow key={barbershop.id}>
                                    <TableCell>{barbershop.id}</TableCell>
                                    <TableCell>{barbershop.name}</TableCell>
                                    <TableCell>{barbershop.address}</TableCell>
                                    <TableCell>{barbershop.lat?.toFixed(6)}</TableCell>
                                    <TableCell>{barbershop.lon?.toFixed(6)}</TableCell>
                                    <TableCell>
                                        {new Date(barbershop.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            component={Link}
                                            to={`/admin/barbershops/${barbershop.id}`}
                                            size="small"
                                            sx={{ mr: 1 }}
                                        >
                                            Редактировать
                                        </Button>
                                        <Button
                                            onClick={() => handleDelete(barbershop.id)}
                                            color="error"
                                            size="small"
                                            disabled={deletingId === barbershop.id}
                                        >
                                            {deletingId === barbershop.id
                                                ? <CircularProgress size={24} />
                                                : 'Удалить'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    {debouncedSearch ? "По вашему запросу ничего не найдено" : "Барбершопы не найдены"}
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

export default AdminBarbershopList;