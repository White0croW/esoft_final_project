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
import { User, Role } from '../../../types';
import api from '../../../api/base';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { useDebounce } from 'use-debounce';

type SortField = 'id' | 'name' | 'email' | 'role';
type SortDirection = 'asc' | 'desc';

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
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

    // Реф для сохранения фокуса на поле поиска
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!currentUser || currentUser.role !== Role.ADMIN) return;

        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await api.get('/admin/users');
                setUsers(response.data);
                setTotalPages(Math.ceil(response.data.length / itemsPerPage));

                // Возвращаем фокус на поле поиска после загрузки
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            } catch (error) {
                setError('Не удалось загрузить список пользователей');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [currentUser]);

    const handleSort = (field: SortField) => {
        const isAsc = sortField === field && sortDirection === 'asc';
        setSortDirection(isAsc ? 'desc' : 'asc');
        setSortField(field);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            try {
                await api.delete(`/admin/users/${id}`);
                setUsers(users.filter(user => user.id !== id));
                setTotalPages(Math.ceil((users.length - 1) / itemsPerPage));
                if (page > 1 && (users.length - 1) <= (page - 1) * itemsPerPage) {
                    setPage(page - 1);
                }

                // Возвращаем фокус на поле поиска после удаления
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            } catch (error) {
                setError('Не удалось удалить пользователя');
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

    const filterUsers = (users: User[], search: string) => {
        if (!search) return users;

        const lowerSearch = search.toLowerCase();
        return users.filter(user =>
            user.id.toString().includes(lowerSearch) ||
            (user.name && user.name.toLowerCase().includes(lowerSearch)) ||
            user.email.toLowerCase().includes(lowerSearch) ||
            (user.role === Role.ADMIN ? 'админ' : 'пользователь').includes(lowerSearch)
        );
    };

    const filteredUsers = filterUsers(users, debouncedSearch);
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        const compare = (a: any, b: any) => {
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
        };

        const aValue = a[sortField];
        const bValue = b[sortField];

        return sortDirection === 'asc'
            ? compare(aValue, bValue)
            : compare(bValue, aValue);
    });

    const paginatedUsers = sortedUsers.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    const newTotalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    if (loading) return <LoadingSpinner />;
    if (!currentUser || currentUser.role !== Role.ADMIN) return null;

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
                    to="/admin/users/new"
                    variant="contained"
                >
                    Создать пользователя
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
                            <TableCell sortDirection={sortField === 'email' ? sortDirection : false}>
                                <TableSortLabel
                                    active={sortField === 'email'}
                                    direction={sortField === 'email' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('email')}
                                >
                                    Email
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sortDirection={sortField === 'role' ? sortDirection : false}>
                                <TableSortLabel
                                    active={sortField === 'role'}
                                    direction={sortField === 'role' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('role')}
                                >
                                    Роль
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedUsers.length > 0 ? (
                            paginatedUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.id}</TableCell>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.role === Role.ADMIN ? 'Админ' : 'Пользователь'}</TableCell>
                                    <TableCell>
                                        <Button
                                            component={Link}
                                            to={`/admin/users/${user.id}`}
                                            size="small"
                                            sx={{ mr: 1 }}
                                        >
                                            Редактировать
                                        </Button>
                                        <Button
                                            onClick={() => handleDelete(user.id)}
                                            color="error"
                                            size="small"
                                            disabled={user.id === currentUser?.id}
                                        >
                                            Удалить
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    {debouncedSearch ? "По вашему запросу ничего не найдено" : "Пользователи не найдены"}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {newTotalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                        count={newTotalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                    />
                </Box>
            )}
        </div>
    );
};

export default UserList;