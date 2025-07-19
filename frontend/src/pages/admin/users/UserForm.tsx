import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    TextField,
    Button,
    Box,
    MenuItem,
    Typography,
    FormControl,
    InputLabel,
    Select,
    Alert,
    CircularProgress
} from '@mui/material';
import { User, Role, UserCreateData, UserUpdateData } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';
import validator from 'validator';
import { adminUserApi } from '../../../api/admin/users';
import { useSnackbar } from 'notistack';

interface UserFormState {
    name: string;
    email: string;
    password: string;
    role: Role;
    phone: string;
}

const UserForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, updateUser } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(!!id);
    const [formData, setFormData] = useState<UserFormState>({
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
                setLoading(true);
                const user = await adminUserApi.getById(parseInt(id));
                setFormData({
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone || '',
                    password: ''
                });
            } catch (error: any) {
                const errorMessage = error.response?.data?.message ||
                    'Не удалось загрузить данные пользователя';
                enqueueSnackbar(errorMessage, {
                    variant: 'error',
                    autoHideDuration: 3000
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id, currentUser, enqueueSnackbar]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Имя обязательно';
        if (!validator.isEmail(formData.email)) newErrors.email = 'Некорректный email';

        if (!id) {
            if (!formData.password) {
                newErrors.password = 'Пароль обязателен';
            } else if (formData.password.length < 6) {
                newErrors.password = 'Пароль должен быть не менее 6 символов';
            }
        } else if (formData.password && formData.password.length > 0 && formData.password.length < 6) {
            newErrors.password = 'Пароль должен быть не менее 6 символов';
        }

        // Улучшенная валидация телефона
        if (formData.phone && !validator.isMobilePhone(formData.phone, 'any')) {
            newErrors.phone = 'Некорректный номер телефона. Формат: +79161234567';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setLoading(true);
            let userId: number;

            if (id && currentUser) {
                const updatePayload: UserUpdateData = {
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                    phone: formData.phone
                };

                if (formData.password.trim() !== '') {
                    updatePayload.password = formData.password;
                }

                const updatedUser = await adminUserApi.update(parseInt(id), updatePayload);
                userId = updatedUser.id;

                if (currentUser.id === userId) {
                    updateUser(updatedUser);
                }

                enqueueSnackbar('Пользователь успешно обновлен', {
                    variant: 'success',
                    autoHideDuration: 3000
                });
            } else {
                const createPayload: UserCreateData = {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                    phone: formData.phone
                };

                const newUser = await adminUserApi.create(createPayload);
                userId = newUser.id;

                enqueueSnackbar('Пользователь успешно создан', {
                    variant: 'success',
                    autoHideDuration: 3000
                });
            }

            navigate(`/admin/users?highlight=${userId}`);
        } catch (error: any) {
            let errorMessage = 'Ошибка сохранения пользователя';
            const fieldErrors: Record<string, string> = {};

            // Обработка ошибок валидации с бэкенда
            if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
                error.response.data.errors.forEach((err: any) => {
                    if (err.path) {
                        fieldErrors[err.path] = err.msg;
                    }
                });
                setErrors(fieldErrors);
            }
            // Обработка других форматов ошибок
            else if (error.response) {
                if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                }
            }

            setSubmitError(errorMessage);
            enqueueSnackbar(errorMessage, {
                variant: 'error',
                autoHideDuration: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleRoleChange = (e: any) => {
        setFormData(prev => ({ ...prev, role: e.target.value as Role }));
    };

    if (loading) return <LoadingSpinner />;
    if (!currentUser || currentUser.role !== Role.ADMIN) return null;

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mt: 4, p: 3, backgroundColor: 'white', borderRadius: 2, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>
                {id ? 'Редактировать пользователя' : 'Добавить нового пользователя'}
            </Typography>

            {submitError && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSubmitError('')}>
                    {submitError}
                </Alert>
            )}

            <TextField
                fullWidth
                margin="normal"
                label="Имя пользователя"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
                sx={{ mb: 2 }}
            />

            <TextField
                fullWidth
                margin="normal"
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                required
                sx={{ mb: 2 }}
            />

            <TextField
                fullWidth
                margin="normal"
                label="Пароль"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password || (id ? "Оставьте пустым, чтобы не менять пароль" : "")}
                required={!id}
                sx={{ mb: 2 }}
            />

            <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
                <InputLabel>Роль</InputLabel>
                <Select
                    value={formData.role}
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
                value={formData.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone || "Формат: +79161234567"}
                sx={{ mb: 3 }}
                placeholder="+79161234567"
            />

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    sx={{
                        bgcolor: '#4f46e5',
                        '&:hover': { bgcolor: '#4338ca' },
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        boxShadow: '0 4px 6px rgba(79, 70, 229, 0.3)'
                    }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Сохранить'}
                </Button>
                <Button
                    component={Link}
                    to="/admin/users"
                    variant="outlined"
                    sx={{
                        borderColor: '#cbd5e0',
                        color: '#4a5568',
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 500
                    }}
                >
                    Отмена
                </Button>
            </Box>
        </Box>
    );
};

export default UserForm;