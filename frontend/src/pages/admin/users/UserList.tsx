import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { User, Role } from '../../../types';
import api from '../../../api/base';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (!user || user.role !== Role.ADMIN) return;

        const fetchUsers = async () => {
            try {
                const response = await api.get('/admin/users');
                setUsers(response.data);
            } catch (error) {
                console.error('Ошибка загрузки пользователей:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [user]);

    const handleDelete = async (id: number) => {
        if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            try {
                await api.delete(`/admin/users/${id}`);
                setUsers(users.filter(user => user.id !== id));
            } catch (error) {
                console.error('Ошибка удаления пользователя:', error);
            }
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!user || user.role !== Role.ADMIN) return null;

    return (
        <div>
            <Button
                component={Link}
                to="/admin/users/new"
                variant="contained"
                sx={{ mb: 2 }}
            >
                Создать пользователя
            </Button>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Имя</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Роль</TableCell>
                            <TableCell>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
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
                                    >
                                        Удалить
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default UserList;