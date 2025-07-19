import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    TextField,
    Button,
    Box,
    Typography,
    Alert,
    CircularProgress,
    Autocomplete,
    InputAdornment,
    Grid,
    Rating,
    Tooltip
} from '@mui/material';
import { Person as PersonIcon, Star as StarIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { Barber, BarberShop } from '../../../types';
import { adminBarberApi } from '../../../api/admin/barbers';
import { adminBarbershopApi } from '../../../api/admin/barbershops';

type BarberFormData = Omit<Barber, 'id' | 'createdAt' | 'services'>;

const BarberForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(!!id);
    const [formData, setFormData] = useState<BarberFormData>({
        name: '',
        specialization: '',
        barbershopId: undefined,
        rating: 0
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

                // Загрузка барбершопов
                const shopsResponse = await adminBarbershopApi.getAll({
                    page: 1,
                    limit: 100,
                    sortBy: 'name',
                    sortOrder: 'asc'
                });
                if (isMounted) setBarbershops(shopsResponse.data || []);

                // Загрузка данных мастера
                if (id) {
                    const barber = await adminBarberApi.getById(parseInt(id));
                    if (isMounted) {
                        setFormData({
                            name: barber.name,
                            specialization: barber.specialization || '',
                            barbershopId: barber.barbershopId ?? undefined,
                            rating: barber.rating || 0
                        });
                    }
                }
            } catch (error: any) {
                if (isMounted) {
                    const errorMessage = error.response?.data?.error ||
                        'Не удалось загрузить данные';
                    setSubmitError(errorMessage);
                    enqueueSnackbar(errorMessage, {
                        variant: 'error',
                        autoHideDuration: 3000
                    });
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
    }, [id, currentUser, enqueueSnackbar]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Имя обязательно';
        }

        if (formData.rating !== undefined && (formData.rating < 0 || formData.rating > 5)) {
            newErrors.rating = 'Рейтинг должен быть от 0 до 5';
        }

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
                enqueueSnackbar('Мастер успешно обновлен', {
                    variant: 'success',
                    autoHideDuration: 3000
                });
                // Перенаправляем с параметром highlight
                navigate(`/admin/barbers?highlight=${id}`);
            } else {
                const created = await adminBarberApi.create(formData);
                enqueueSnackbar('Мастер успешно создан', {
                    variant: 'success',
                    autoHideDuration: 3000
                });
                // Перенаправляем с параметром highlight
                navigate(`/admin/barbers?highlight=${created.id}`);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.error ||
                'Ошибка сохранения мастера';
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
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    if (!currentUser || currentUser.role !== 'ADMIN') return null;
    if (loading) return <LoadingSpinner />;

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{
            maxWidth: 800,
            mt: 4,
            p: 4,
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 700, color: '#2d3748' }}>
                {id ? 'Редактировать мастера' : 'Добавить нового мастера'}
            </Typography>

            {submitError && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSubmitError('')}>
                    {submitError}
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Имя"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        error={!!errors.name}
                        helperText={errors.name || "Полное имя мастера"}
                        required
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PersonIcon color="action" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 2 }
                        }}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Специализация"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        error={!!errors.specialization}
                        helperText={errors.specialization || "Основные услуги мастера"}
                        InputProps={{
                            sx: { borderRadius: 2 }
                        }}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    {loadingBarbershops ? (
                        <Box display="flex" justifyContent="center" mt={2}>
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
                                setErrors(prev => ({ ...prev, barbershopId: '' }));
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Барбершоп"
                                    margin="normal"
                                    helperText="Выберите барбершоп"
                                    error={!!errors.barbershopId}
                                />
                            )}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                        />
                    )}
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Box mt={2}>
                        <Typography component="legend" mb={1}>
                            Рейтинг мастера
                        </Typography>
                        <Tooltip title="Установите рейтинг от 0 до 5">
                            <Box display="flex" alignItems="center" gap={2}>
                                <Rating
                                    name="rating"
                                    value={formData.rating}
                                    precision={0.5}
                                    onChange={(_, newValue) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            rating: newValue || 0
                                        }));
                                    }}
                                    size="large"
                                    emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                                />
                                <Typography variant="h6">
                                    {formData.rating.toFixed(1)}
                                </Typography>
                            </Box>
                        </Tooltip>
                        {errors.rating && (
                            <Typography color="error" variant="body2" mt={1}>
                                {errors.rating}
                            </Typography>
                        )}
                    </Box>
                </Grid>
            </Grid>

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
                        boxShadow: '0 4px 6px rgba(79, 70, 229, 0.3)',
                        minWidth: 120
                    }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Сохранить'}
                </Button>

                <Button
                    component={Link}
                    to="/admin/barbers"
                    variant="outlined"
                    disabled={loading}
                    sx={{
                        borderColor: '#cbd5e0',
                        color: '#4a5568',
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 500,
                        minWidth: 120
                    }}
                >
                    Отмена
                </Button>
            </Box>
        </Box>
    );
};

export default BarberForm;