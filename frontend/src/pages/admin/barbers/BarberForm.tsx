import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    TextField,
    Button,
    Box,
    Typography,
    Alert,
    CircularProgress,
    Autocomplete
} from '@mui/material';
import { adminBarberApi } from '../../../api/admin/barbers';
import { adminBarbershopApi } from '../../../api/admin/barbershops';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { Barber, BarberShop } from '../../../types';

type BarberFormData = Omit<Barber, 'id' | 'createdAt'>;

const BarberForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [loading, setLoading] = useState(!!id);
    const [formData, setFormData] = useState<BarberFormData>({
        name: '',
        specialization: '',
        barbershopId: undefined,
        rating: 0,
        services: []
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');
    const [barbershops, setBarbershops] = useState<BarberShop[]>([]);
    const [loadingBarbershops, setLoadingBarbershops] = useState(true);

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'ADMIN') return;

        let isMounted = true;

        const fetchData = async () => {
            try {
                setLoading(true);
                setLoadingBarbershops(true);

                // Загрузка барбершопов с обработкой пагинации
                const response = await adminBarbershopApi.getAll();
                // Извлекаем массив барбершопов из свойства data
                const shops = response.data || [];
                if (isMounted) setBarbershops(shops);

                // Загрузка данных мастера
                if (id) {
                    const barber = await adminBarberApi.getById(parseInt(id));
                    if (isMounted) {
                        setFormData({
                            name: barber.name,
                            specialization: barber.specialization || '',
                            barbershopId: barber.barbershopId ?? undefined,
                            rating: barber.rating,
                            services: barber.services
                        });
                    }
                }
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
                if (isMounted) {
                    setSubmitError('Не удалось загрузить данные');
                    setBarbershops([]);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                    setLoadingBarbershops(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [id, currentUser]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Имя обязательно';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setLoading(true);
            if (id) {
                await adminBarberApi.update(parseInt(id), formData);
            } else {
                await adminBarberApi.create(formData);
            }
            navigate('/admin/barbers');
        } catch (error: any) {
            console.error('Ошибка сохранения:', error);
            setSubmitError(error.response?.data?.error || 'Ошибка сохранения');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    if (!currentUser || currentUser.role !== 'ADMIN') return null;
    if (loading) return <LoadingSpinner />;

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                {id ? 'Редактировать мастера' : 'Добавить нового мастера'}
            </Typography>

            {submitError && <Alert severity="error" sx={{ mb: 3 }}>{submitError}</Alert>}

            <TextField
                fullWidth
                margin="normal"
                label="Имя"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
            />

            <TextField
                fullWidth
                margin="normal"
                label="Специализация"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                helperText={errors.specialization}
            />

            {loadingBarbershops ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <CircularProgress size={24} />
                </Box>
            ) : (
                <Autocomplete
                    options={barbershops}
                    getOptionLabel={(option) => option.name}
                    value={barbershops.find(b => b.id === formData.barbershopId) || null}
                    onChange={(_, newValue) => {
                        setFormData(prev => ({
                            ...prev,
                            barbershopId: newValue ? newValue.id : undefined
                        }));
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Барбершоп"
                            margin="normal"
                            helperText="Выберите барбершоп"
                        />
                    )}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                />
            )}

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Сохранить'}
                </Button>
                <Button
                    component={Link}
                    to="/admin/barbers"
                    variant="outlined"
                >
                    Отмена
                </Button>
            </Box>
        </Box>
    );
};

export default BarberForm;