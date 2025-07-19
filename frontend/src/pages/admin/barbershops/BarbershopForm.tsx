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
    Autocomplete,
    InputAdornment
} from '@mui/material';
import { LocationOn as LocationIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { DadataSuggestion } from '../../../types';
import { adminBarbershopApi } from '../../../api/admin/barbershops';

const BarbershopForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(!!id);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        lat: 0,
        lon: 0,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');

    const [addressInput, setAddressInput] = useState('');
    const [addressSuggestions, setAddressSuggestions] = useState<DadataSuggestion[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    useEffect(() => {
        if (!id || !currentUser || currentUser.role !== 'ADMIN') return;

        let isMounted = true;

        const fetchBarbershop = async () => {
            try {
                setLoading(true);
                const data = await adminBarbershopApi.getById(parseInt(id));

                if (isMounted) {
                    setFormData({
                        name: data.name,
                        address: data.address,
                        lat: data.lat,
                        lon: data.lon,
                    });
                    setAddressInput(data.address);
                }
            } catch (error: any) {
                if (isMounted) {
                    const errorMessage = error.response?.data?.error ||
                        'Не удалось загрузить данные барбершопа';
                    setSubmitError(errorMessage);
                    enqueueSnackbar(errorMessage, {
                        variant: 'error',
                        autoHideDuration: 3000
                    });
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
    }, [id, currentUser, enqueueSnackbar]);

    const fetchAddressSuggestions = async (query: string) => {
        if (!query || query.length < 3) {
            setAddressSuggestions([]);
            return;
        }

        try {
            setLoadingSuggestions(true);
            const response = await adminBarbershopApi.suggestAddress(query);
            setAddressSuggestions(response.suggestions || []);
        } catch (error) {
            enqueueSnackbar('Ошибка при получении подсказок адреса', {
                variant: 'error',
                autoHideDuration: 3000
            });
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const handleAddressInputChange = (
        _: React.SyntheticEvent,
        newValue: string
    ) => {
        setAddressInput(newValue);
        if (newValue.length >= 3) {
            fetchAddressSuggestions(newValue);
        }
    };

    const handleAddressChange = (
        _: React.SyntheticEvent,
        value: string | DadataSuggestion | null
    ) => {
        if (typeof value === 'string') {
            setAddressInput(value);
            setFormData(prev => ({
                ...prev,
                address: value,
                lat: 0,
                lon: 0,
            }));
        } else if (value) {
            setAddressInput(value.value);
            setFormData(prev => ({
                ...prev,
                address: value.value,
                lat: parseFloat(value.data.geo_lat) || 0,
                lon: parseFloat(value.data.geo_lon) || 0,
            }));
        } else {
            setAddressInput('');
            setFormData(prev => ({
                ...prev,
                address: '',
                lat: 0,
                lon: 0,
            }));
        }

        setErrors(prev => ({ ...prev, address: '', lat: '', lon: '' }));
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
            [name]: name === 'lat' || name === 'lon' ? parseFloat(value) || 0 : value
        }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setLoading(true);
            const { name, address, lat, lon } = formData;
            const submitData = { name, address, lat, lon };

            let barbershopId: number;
            if (id) {
                const updated = await adminBarbershopApi.update(parseInt(id), submitData);
                barbershopId = updated.id;
                enqueueSnackbar('Барбершоп успешно обновлен', {
                    variant: 'success',
                    autoHideDuration: 3000
                });
            } else {
                const created = await adminBarbershopApi.create(submitData);
                barbershopId = created.id;
                enqueueSnackbar('Барбершоп успешно создан', {
                    variant: 'success',
                    autoHideDuration: 3000
                });
            }

            navigate(`/admin/barbershops?highlight=${barbershopId}`);
        } catch (error: any) {
            const errorMessage = error.response?.data?.error ||
                'Ошибка сохранения барбершопа';
            setSubmitError(errorMessage);
            enqueueSnackbar(errorMessage, {
                variant: 'error',
                autoHideDuration: 3000
            });
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
        <Box component="form" onSubmit={handleSubmit} sx={{
            maxWidth: 800,
            mt: 4,
            p: 4,
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 700, color: '#2d3748' }}>
                {id ? 'Редактировать барбершоп' : 'Добавить новый барбершоп'}
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
                        label="Название"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        error={!!errors.name}
                        helperText={errors.name || "Полное название барбершопа"}
                        required
                        InputProps={{
                            sx: { borderRadius: 2 }
                        }}
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
                                helperText={errors.address || "Начните вводить адрес для подсказок"}
                                required
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LocationIcon color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <>
                                            {loadingSuggestions ? (
                                                <CircularProgress color="inherit" size={20} />
                                            ) : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                    sx: { borderRadius: 2 }
                                }}
                            />
                        )}
                        renderOption={(props, option) => (
                            <li {...props} key={option.value}>
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
                        InputProps={{
                            endAdornment: <InputAdornment position="end">°</InputAdornment>,
                            sx: { borderRadius: 2 }
                        }}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }} >
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
                        InputProps={{
                            endAdornment: <InputAdornment position="end">°</InputAdornment>,
                            sx: { borderRadius: 2 }
                        }}
                    />
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
                    to="/admin/barbershops"
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

export default BarbershopForm;