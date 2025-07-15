import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    TextField,
    Button,
    Box,
    Typography,
    Alert,
    CircularProgress,
    Grid,
    Autocomplete
} from '@mui/material';
import api from '../../../api/base';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { BarberShop } from '../../../types';

// Тип для подсказок DaData
interface DadataSuggestion {
    value: string;
    data: {
        geo_lat: string;
        geo_lon: string;
        [key: string]: any;
    };
}

const BarbershopForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [loading, setLoading] = useState(!!id);
    const [formData, setFormData] = useState<Omit<BarberShop, 'id' | 'createdAt' | 'barbers'>>({
        name: '',
        address: '',
        lat: 0,
        lon: 0,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');

    // Состояния для автодополнения
    const [addressInput, setAddressInput] = useState('');
    const [addressSuggestions, setAddressSuggestions] = useState<DadataSuggestion[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    useEffect(() => {
        if (!id || !currentUser || currentUser.role !== 'ADMIN') return;

        let isMounted = true;

        const fetchBarbershop = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/admin/barbershops/${id}`);
                const data = response.data;

                if (isMounted) {
                    setFormData({
                        name: data.name,
                        address: data.address,
                        lat: data.lat,
                        lon: data.lon,
                    });
                    setAddressInput(data.address);
                }
            } catch (error) {
                console.error('Ошибка загрузки барбершопа:', error);
                if (isMounted) {
                    setSubmitError('Не удалось загрузить данные барбершопа');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchBarbershop();

        return () => {
            isMounted = false;
        };
    }, [id, currentUser]);

    // Запрос к API для получения подсказок адресов
    const fetchAddressSuggestions = async (query: string) => {
        if (!query) {
            setAddressSuggestions([]);
            return;
        }

        try {
            setLoadingSuggestions(true);
            const response = await api.post('/suggest/address', { query });
            setAddressSuggestions(response.data.suggestions || []);
        } catch (error) {
            console.error('Ошибка при получении подсказок адреса:', error);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    // Обработчик изменения поля адреса
    const handleAddressInputChange = (
        _: React.SyntheticEvent,
        newValue: string
    ) => {
        setAddressInput(newValue);
        fetchAddressSuggestions(newValue);
    };

    // Исправленный обработчик выбора адреса
    const handleAddressChange = (
        _: React.SyntheticEvent,
        value: string | DadataSuggestion | null
    ) => {
        if (typeof value === 'string') {
            // Пользователь ввел произвольный текст
            setAddressInput(value);
            setFormData(prev => ({
                ...prev,
                address: value,
                // Координаты не меняем - пользователь должен выбрать из подсказок
            }));
        } else if (value && 'data' in value) {
            // Выбрана подсказка из DaData
            setAddressInput(value.value);
            setFormData(prev => ({
                ...prev,
                address: value.value,
                lat: parseFloat(value.data.geo_lat) || 0,
                lon: parseFloat(value.data.geo_lon) || 0,
            }));
        } else {
            // Сброс значения
            setAddressInput('');
            setFormData(prev => ({
                ...prev,
                address: '',
                lat: 0,
                lon: 0,
            }));
        }

        // Сбрасываем ошибки для адреса и координат
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.address;
            delete newErrors.lat;
            delete newErrors.lon;
            return newErrors;
        });
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Название обязательно';
        }

        if (!formData.address.trim()) {
            newErrors.address = 'Адрес обязателен';
        }

        if (isNaN(formData.lat)) {
            newErrors.lat = 'Широта должна быть числом';
        } else if (formData.lat < -90 || formData.lat > 90) {
            newErrors.lat = 'Широта должна быть между -90 и 90';
        }

        if (isNaN(formData.lon)) {
            newErrors.lon = 'Долгота должна быть числом';
        } else if (formData.lon < -180 || formData.lon > 180) {
            newErrors.lon = 'Долгота должна быть между -180 и 180';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: name === 'lat' || name === 'lon'
                ? parseFloat(value) || 0
                : value
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setLoading(true);
            if (id) {
                await api.put(`/admin/barbershops/${id}`, formData);
            } else {
                await api.post('/admin/barbershops', formData);
            }
            navigate('/admin/barbershops');
        } catch (error: any) {
            console.error('Ошибка сохранения барбершопа:', error);
            setSubmitError(error.response?.data?.error || 'Ошибка сохранения');
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser || currentUser.role !== 'ADMIN') {
        return null;
    }

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                {id ? 'Редактировать барбершоп' : 'Добавить новый барбершоп'}
            </Typography>

            {submitError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {submitError}
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Название"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        error={!!errors.name}
                        helperText={errors.name}
                        required
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Autocomplete
                        freeSolo
                        options={addressSuggestions}
                        getOptionLabel={(option) =>
                            typeof option === 'string' ? option : option.value
                        }
                        inputValue={addressInput}
                        onInputChange={handleAddressInputChange}
                        onChange={handleAddressChange}
                        loading={loadingSuggestions}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Адрес"
                                margin="normal"
                                error={!!errors.address}
                                helperText={errors.address || "Начните вводить адрес для получения подсказок"}
                                required
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {loadingSuggestions ? (
                                                <CircularProgress color="inherit" size={20} />
                                            ) : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                        renderOption={(props, option) => (
                            <li {...props}>
                                {option.value}
                            </li>
                        )}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Широта"
                        name="lat"
                        type="number"
                        value={formData.lat}
                        onChange={handleChange}
                        error={!!errors.lat}
                        helperText={errors.lat || "Заполняется автоматически при выборе адреса"}
                        inputProps={{
                            step: "0.000001",
                            readOnly: true
                        }}
                        required
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Долгота"
                        name="lon"
                        type="number"
                        value={formData.lon}
                        onChange={handleChange}
                        error={!!errors.lon}
                        helperText={errors.lon || "Заполняется автоматически при выборе адреса"}
                        inputProps={{
                            step: "0.000001",
                            readOnly: true
                        }}
                        required
                    />
                </Grid>
            </Grid>

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
                    to="/admin/barbershops"
                    variant="outlined"
                    disabled={loading}
                >
                    Отмена
                </Button>
            </Box>
        </Box>
    );
};

export default BarbershopForm;