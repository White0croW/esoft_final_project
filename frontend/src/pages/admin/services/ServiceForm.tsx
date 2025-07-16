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
                    console.error('Ошибка загрузки услуги:', error);
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
            if (id) {
                await adminServiceApi.update(parseInt(id), formData);
            } else {
                await adminServiceApi.create(formData);
            }
            navigate('/admin/services');
        } catch (error: any) {
            console.error('Ошибка сохранения:', error);
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
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mt: 4 }}>
            <Typography variant="h5" gutterBottom>
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
            />

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Сохранить'}
                </Button>
                <Button component={Link} to="/admin/services" variant="outlined">
                    Отмена
                </Button>
            </Box>
        </Box>
    );
};

export default ServiceForm;