import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Alert,
    CircularProgress,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Button,
    Card,
    CardContent,
    TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { format, getDay } from 'date-fns';
import { Appointment, AppointmentStatus, Barber, Service, User } from '../../../types';
import { adminAppointmentApi } from '../../../api/admin/appointments';
import { adminBarberApi } from '../../../api/admin/barbers';
import { adminServiceApi } from '../../../api/admin/services';
import { adminUserApi } from '../../../api/admin/users';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { fetchAvailableSlots } from '../../../api/barber'; // Импорт функции получения слотов

// Типы для формы
type AppointmentFormData = {
    userId: number;
    serviceId: number;
    barberId: number;
    date: Date | null;
    startTime: Date | null;
    endTime: string;
    status: AppointmentStatus;
};

type AppointmentSubmitData = {
    userId: number;
    serviceId: number;
    barberId: number;
    date: string;
    startTime: string;
    endTime: string;
    status: AppointmentStatus;
};

type TimeSlot = {
    start: string;
    end: string;
};

const AppointmentForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [loading, setLoading] = useState(!!id);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState<AppointmentFormData>({
        userId: 0,
        serviceId: 0,
        barberId: 0,
        date: new Date(),
        startTime: new Date(new Date().setHours(10, 0, 0, 0)),
        endTime: '10:30',
        status: AppointmentStatus.NEW
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');

    const [services, setServices] = useState<Service[]>([]);
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    // Состояния для слотов времени
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [slotError, setSlotError] = useState('');

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'ADMIN') return;

        const fetchData = async () => {
            try {
                setLoading(true);

                // Загрузка справочных данных
                const [servicesRes, barbersRes, usersRes] = await Promise.all([
                    adminServiceApi.getAll(),
                    adminBarberApi.getAll(),
                    adminUserApi.getAll()
                ]);

                setServices(servicesRes.data);
                setBarbers(barbersRes.data);
                setUsers(usersRes);

                // Загрузка данных записи, если редактирование
                if (id) {
                    const appointment = await adminAppointmentApi.getById(parseInt(id));

                    // Создаем объект Date для времени начала
                    const startDate = new Date(appointment.date);
                    const [hours, minutes] = appointment.startTime.split(':').map(Number);
                    startDate.setHours(hours, minutes);

                    setFormData({
                        ...appointment,
                        date: new Date(appointment.date),
                        startTime: startDate
                    });

                    // Находим выбранную услугу для расчета времени
                    const service = servicesRes.data.find(s => s.id === appointment.serviceId);
                    setSelectedService(service || null);
                }
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
                setSubmitError('Не удалось загрузить данные');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, currentUser]);

    // Загрузка доступных слотов при изменении даты, услуги или барбера
    useEffect(() => {
        const fetchTimeSlots = async () => {
            if (!formData.date || !formData.serviceId || !formData.barberId) {
                setTimeSlots([]);
                return;
            }

            try {
                setLoadingSlots(true);
                setSlotError('');

                const dateStr = format(formData.date, 'yyyy-MM-dd');

                // Используем ту же функцию, что и в клиентской части
                const slots = await fetchAvailableSlots(
                    formData.barberId,
                    formData.serviceId,
                    dateStr
                );

                setTimeSlots(slots);
            } catch (error) {
                console.error('Ошибка загрузки слотов:', error);
                setSlotError('Не удалось загрузить доступное время');
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchTimeSlots();
    }, [formData.date, formData.serviceId, formData.barberId]);

    // Расчет времени окончания при изменении времени начала
    useEffect(() => {
        if (!selectedService || !formData.startTime) return;

        const calculateEndTime = () => {
            const startTime = formData.startTime!;
            const endTime = new Date(startTime.getTime() + selectedService.duration * 60000);

            const endHours = endTime.getHours().toString().padStart(2, '0');
            const endMinutes = endTime.getMinutes().toString().padStart(2, '0');

            setFormData(prev => ({
                ...prev,
                endTime: `${endHours}:${endMinutes}`
            }));
        };

        calculateEndTime();
    }, [formData.startTime, selectedService]);

    const handleServiceChange = (serviceId: number) => {
        const service = services.find(s => s.id === serviceId);
        setSelectedService(service || null);
        setFormData(prev => ({ ...prev, serviceId }));
    };

    const handleTimeSelect = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        const newStartTime = new Date(formData.date!);
        newStartTime.setHours(hours, minutes, 0, 0);

        setFormData(prev => ({
            ...prev,
            startTime: newStartTime
        }));
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.userId) newErrors.userId = 'Выберите клиента';
        if (!formData.serviceId) newErrors.serviceId = 'Выберите услугу';
        if (!formData.barberId) newErrors.barberId = 'Выберите барбера';
        if (!formData.date) newErrors.date = 'Укажите дату';
        if (!formData.startTime) newErrors.startTime = 'Укажите время начала';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setSubmitting(true);

            // Форматирование времени
            const startHours = formData.startTime?.getHours().toString().padStart(2, '0') || '00';
            const startMinutes = formData.startTime?.getMinutes().toString().padStart(2, '0') || '00';
            const startTime = `${startHours}:${startMinutes}`;

            const data: AppointmentSubmitData = {
                userId: formData.userId,
                serviceId: formData.serviceId,
                barberId: formData.barberId,
                date: formData.date ? format(formData.date, 'yyyy-MM-dd') : '',
                startTime,
                endTime: formData.endTime,
                status: formData.status
            };

            if (id) {
                await adminAppointmentApi.update(parseInt(id), data);
            } else {
                await adminAppointmentApi.create(data);
            }

            navigate('/admin/appointments');
        } catch (error) {
            console.error('Ошибка сохранения записи:', error);
            setSubmitError('Ошибка сохранения записи');
        } finally {
            setSubmitting(false);
        }
    };

    if (!currentUser || currentUser.role !== 'ADMIN') {
        return null;
    }

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
            <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    {id ? 'Редактировать запись' : 'Создать новую запись'}
                </Typography>

                {submitError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {submitError}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    {/* Клиент */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth error={!!errors.userId}>
                            <InputLabel>Клиент *</InputLabel>
                            <Select
                                value={formData.userId || ''}
                                onChange={(e) => setFormData({ ...formData, userId: Number(e.target.value) })}
                                label="Клиент *"
                            >
                                {users.map(user => (
                                    <MenuItem key={user.id} value={user.id}>
                                        {user.name} ({user.email})
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.userId && <FormHelperText>{errors.userId}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    {/* Услуга */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth error={!!errors.serviceId}>
                            <InputLabel>Услуга *</InputLabel>
                            <Select
                                value={formData.serviceId || ''}
                                onChange={(e) => handleServiceChange(Number(e.target.value))}
                                label="Услуга *"
                            >
                                {services.map(service => (
                                    <MenuItem key={service.id} value={service.id}>
                                        {service.name} ({service.duration} мин)
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.serviceId && <FormHelperText>{errors.serviceId}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    {/* Барбер */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth error={!!errors.barberId}>
                            <InputLabel>Барбер *</InputLabel>
                            <Select
                                value={formData.barberId || ''}
                                onChange={(e) => setFormData({ ...formData, barberId: Number(e.target.value) })}
                                label="Барбер *"
                            >
                                {barbers.map(barber => (
                                    <MenuItem key={barber.id} value={barber.id}>
                                        {barber.name} ({barber.barbershop?.name})
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.barberId && <FormHelperText>{errors.barberId}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    {/* Статус */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth>
                            <InputLabel>Статус</InputLabel>
                            <Select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as AppointmentStatus })}
                                label="Статус"
                            >
                                {Object.values(AppointmentStatus).map(status => (
                                    <MenuItem key={status} value={status}>{status}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Дата */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <DatePicker
                            label="Дата *"
                            value={formData.date}
                            onChange={(newDate) => setFormData({ ...formData, date: newDate as Date | null })}
                            minDate={new Date()}
                            shouldDisableDate={(date) => date ? getDay(date) === 0 : false}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    error: !!errors.date,
                                    helperText: errors.date
                                }
                            }}
                        />
                    </Grid>

                    {/* Время окончания (только для отображения) */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            label="Время окончания"
                            value={formData.endTime}
                            fullWidth
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                    </Grid>

                    {/* Выбор времени через слоты */}
                    <Grid size={{ xs: 12}}>
                        <Card sx={{ borderRadius: 2, boxShadow: 2, mt: 1 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Доступное время
                                </Typography>

                                {formData.date && formData.serviceId && formData.barberId ? (
                                    <>
                                        {loadingSlots ? (
                                            <Box display="flex" justifyContent="center" py={3}>
                                                <CircularProgress size={24} />
                                            </Box>
                                        ) : slotError ? (
                                            <Alert severity="error" sx={{ mb: 2 }}>
                                                {slotError}
                                            </Alert>
                                        ) : timeSlots.length > 0 ? (
                                            <Grid container spacing={1}>
                                                {timeSlots.map((slot, index) => {
                                                    const isSelected = formData.startTime &&
                                                        formData.startTime.getHours() === parseInt(slot.start.split(':')[0]) &&
                                                        formData.startTime.getMinutes() === parseInt(slot.start.split(':')[1]);

                                                    return (
                                                        <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
                                                            <Button
                                                                fullWidth
                                                                variant={isSelected ? "contained" : "outlined"}
                                                                color={isSelected ? "primary" : "inherit"}
                                                                onClick={() => handleTimeSelect(slot.start)}
                                                                sx={{
                                                                    py: 1.5,
                                                                    borderRadius: 2,
                                                                    fontWeight: isSelected ? 600 : 500,
                                                                    boxShadow: isSelected ? 2 : 0,
                                                                    transition: 'all 0.2s ease',
                                                                    '&:hover': {
                                                                        transform: 'translateY(-2px)',
                                                                        boxShadow: 2
                                                                    }
                                                                }}
                                                            >
                                                                {slot.start}
                                                            </Button>
                                                        </Grid>
                                                    );
                                                })}
                                            </Grid>
                                        ) : (
                                            <Alert severity="info">
                                                Нет доступных слотов на выбранную дату
                                            </Alert>
                                        )}
                                    </>
                                ) : (
                                    <Alert severity="info">
                                        Выберите дату, услугу и барбера для просмотра доступного времени
                                    </Alert>
                                )}

                                {errors.startTime && (
                                    <FormHelperText error sx={{ mt: 1 }}>
                                        {errors.startTime}
                                    </FormHelperText>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={submitting}
                    >
                        {submitting ? <CircularProgress size={24} /> : 'Сохранить'}
                    </Button>

                    <Button
                        component={Link}
                        to="/admin/appointments"
                        variant="outlined"
                        disabled={submitting}
                    >
                        Отмена
                    </Button>
                </Box>
            </Box>
        </LocalizationProvider>
    );
};

export default AppointmentForm;