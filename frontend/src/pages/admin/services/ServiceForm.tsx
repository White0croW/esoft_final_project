import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    TextField,
    Button,
    Box,
    Typography,
    Alert,
    CircularProgress,
} from '@mui/material';
import { adminServiceApi } from '../../../api/admin/services';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { Service } from '../../../types';

type ServiceFormData = Omit<Service, 'id' | 'createdAt'>;

const ServiceForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [loading, setLoading] = useState(!!id);
    const [formData, setFormData] = useState<ServiceFormData>({
        name: '',
        description: '',
        duration: 30,
        price: 1000,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'ADMIN') return;
        let isMounted = true;

        const fetchData = async () => {
            if (id) {
                try {
                    setLoading(true);
                    const service = await adminServiceApi.getById(parseInt(id));
                    if (isMounted) {
                        setFormData({
                            name: service.name,
                            description: service.description || '',
                            duration: service.duration,
                            price: service.price,
                        });
                    }
                } catch (error) {
                    if (isMounted) setSubmitError('Не удалось загрузить данные услуги');
                } finally {
                    if (isMounted) setLoading(false);
                }
            }
        };

        fetchData();

        return () => { isMounted = false; };
    }, [id, currentUser]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Название обязательно';
        if (formData.duration <= 0) newErrors.duration = 'Длительность должна быть больше 0';
        if (formData.price <= 0) newErrors.price = 'Цена должна быть больше 0';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setLoading(true);
            let serviceId: number;
            if (id) {
                const updatedService = await adminServiceApi.update(parseInt(id), formData);
                serviceId = updatedService.id;
            } else {
                const newService = await adminServiceApi.create(formData);
                serviceId = newService.id;
            }

            // Перенаправляем с параметром highlight
            navigate(`/admin/services?highlight=${serviceId}`);
        } catch (error: any) {
            setSubmitError(error.response?.data?.error || 'Ошибка сохранения услуги');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'duration' || name === 'price' ? Number(value) : value
        }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    if (!currentUser || currentUser.role !== 'ADMIN') return null;
    if (loading) return <LoadingSpinner />;

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mt: 4, p: 3, backgroundColor: 'white', borderRadius: 2, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>
                {id ? 'Редактировать услугу' : 'Добавить новую услугу'}
            </Typography>

            {submitError && <Alert severity="error" sx={{ mb: 3 }}>{submitError}</Alert>}

            <TextField
                fullWidth
                margin="normal"
                label="Название услуги"
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
                label="Описание"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                sx={{ mb: 2 }}
            />

            <TextField
                fullWidth
                margin="normal"
                label="Длительность (минуты)"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange}
                error={!!errors.duration}
                helperText={errors.duration}
                required
                inputProps={{ min: 1 }}
                sx={{ mb: 2 }}
            />

            <TextField
                fullWidth
                margin="normal"
                label="Цена (руб)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                error={!!errors.price}
                helperText={errors.price}
                required
                inputProps={{ min: 0, step: 50 }}
                sx={{ mb: 3 }}
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
                    to="/admin/services"
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

export default ServiceForm;