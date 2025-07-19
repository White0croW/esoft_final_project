import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { TextField, Button, Box, MenuItem, Typography, FormControl, InputLabel, Select, Alert } from '@mui/material';
import { User, Role } from '../../../types';
import api from '../../../api/base';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';
import validator from 'validator';

const UserForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, updateUser } = useAuth(); // Добавили updateUser
    const [loading, setLoading] = useState(!!id);
    const [formUser, setFormUser] = useState<Partial<User>>({
        name: '',
        email: '',
        password: '',
        role: Role.USER,
        phone: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        if (!id || !currentUser || currentUser.role !== Role.ADMIN) return;

        const fetchUser = async () => {
            try {
                const response = await api.get(`/admin/users/${id}`);
                setFormUser(response.data);
            } catch (error) {
                setSubmitError('Не удалось загрузить данные пользователя');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id, currentUser]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formUser.name?.trim()) {
            newErrors.name = 'Имя обязательно';
        }

        if (!validator.isEmail(formUser.email || '')) {
            newErrors.email = 'Некорректный email';
        }

        if (!id && !formUser.password) {
            newErrors.password = 'Пароль обязателен';
        } else if (formUser.password && formUser.password.length < 6) {
            newErrors.password = 'Пароль должен быть не менее 6 символов';
        }

        if (formUser.phone && !validator.isMobilePhone(formUser.phone)) {
            newErrors.phone = 'Некорректный номер телефона';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormUser(prev => ({ ...prev, [name]: value }));
        // Очищаем ошибку при изменении
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleRoleChange = (e: any) => {
        setFormUser(prev => ({ ...prev, role: e.target.value as Role }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            if (id) {
                // Сохраняем обновленного пользователя
                const { data: updatedUser } = await api.put<User>(`/admin/users/${id}`, formUser);

                // Проверяем, является ли пользователь текущим
                if (currentUser && currentUser.id === updatedUser.id) {
                    // Обновляем данные в контексте аутентификации
                    updateUser(updatedUser);
                }
            } else {
                await api.post('/admin/users', formUser);
            }
            navigate('/admin/users');
        } catch (error: any) {
            setSubmitError(error.response?.data?.message || 'Ошибка сохранения');
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!currentUser || currentUser.role !== Role.ADMIN) return null;

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500 }}>
            <Typography variant="h6" gutterBottom>
                {id ? 'Редактировать пользователя' : 'Создать пользователя'}
            </Typography>

            {submitError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {submitError}
                </Alert>
            )}

            <TextField
                fullWidth
                margin="normal"
                label="Имя"
                name="name"
                value={formUser.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
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
                error={!!errors.email}
                helperText={errors.email}
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
                error={!!errors.password}
                helperText={errors.password || (id ? "Оставьте пустым, чтобы не менять пароль" : "")}
                required={!id}
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
                error={!!errors.phone}
                helperText={errors.phone || "Формат: +79161234567"}
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