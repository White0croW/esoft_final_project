import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { TextField, Button, Box, MenuItem, Typography, FormControl, InputLabel, Select } from '@mui/material';
import { User, Role } from '../../../types';
import api from '../../../api/base';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';

const UserForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [loading, setLoading] = useState(!!id);
    const [formUser, setFormUser] = useState<Partial<User>>({
        name: '',
        email: '',
        password: '',
        role: Role.USER,
        phone: ''
    });

    useEffect(() => {
        if (!id || !currentUser || currentUser.role !== Role.ADMIN) return;

        const fetchUser = async () => {
            try {
                const response = await api.get(`/admin/users/${id}`);
                setFormUser(response.data);
            } catch (error) {
                console.error('Ошибка загрузки пользователя:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id, currentUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormUser(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (e: any) => {
        setFormUser(prev => ({ ...prev, role: e.target.value as Role }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (id) {
                await api.put(`/admin/users/${id}`, formUser);
            } else {
                await api.post('/admin/users', formUser);
            }
            navigate('/admin/users');
        } catch (error) {
            console.error('Ошибка сохранения пользователя:', error);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!currentUser || currentUser.role !== Role.ADMIN) return null;

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500 }}>
            <Typography variant="h6" gutterBottom>
                {id ? 'Редактировать пользователя' : 'Создать пользователя'}
            </Typography>

            <TextField
                fullWidth
                margin="normal"
                label="Имя"
                name="name"
                value={formUser.name}
                onChange={handleChange}
                required
            />

            <TextField
                fullWidth
                margin="normal"
                label="Email"
                name="email"
                type="email"
                value={formUser.email}
                onChange={handleChange}
                required
            />

            <TextField
                fullWidth
                margin="normal"
                label="Пароль"
                name="password"
                type="password"
                value={formUser.password}
                onChange={handleChange}
                required={!id}
                helperText={id ? "Оставьте пустым, чтобы не менять пароль" : ""}
            />

            <FormControl fullWidth margin="normal">
                <InputLabel>Роль</InputLabel>
                <Select
                    value={formUser.role}
                    label="Роль"
                    onChange={handleRoleChange}
                    required
                >
                    <MenuItem value={Role.USER}>Пользователь</MenuItem>
                    <MenuItem value={Role.ADMIN}>Администратор</MenuItem>
                </Select>
            </FormControl>

            <TextField
                fullWidth
                margin="normal"
                label="Телефон"
                name="phone"
                value={formUser.phone || ''}
                onChange={handleChange}
            />

            <Box sx={{ mt: 2 }}>
                <Button type="submit" variant="contained">
                    Сохранить
                </Button>
                <Button
                    component={Link}
                    to="/admin/users"
                    variant="outlined"
                    sx={{ ml: 2 }}
                >
                    Отмена
                </Button>
            </Box>
        </Box>
    );
};

export default UserForm;