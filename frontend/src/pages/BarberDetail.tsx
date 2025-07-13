// src/pages/BarberDetail.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchBarberById, fetchAvailableSlots } from "../api/barber";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Barber, Service } from "../types";
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Box,
    CircularProgress,
    Alert,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { createAppointment } from "../api/appointment";

interface TimeSlot {
    start: string;
    end: string;
}

const BarberDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [appointmentError, setAppointmentError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [selectedService, setSelectedService] = useState<number | null>(null);

    const {
        data: barber,
        isLoading,
        error: barberError
    } = useQuery<Barber>({
        queryKey: ["barber", id],
        queryFn: () => fetchBarberById(Number(id))
    });

    // Загрузка доступных слотов времени при изменении даты или услуги
    useEffect(() => {
        if (selectedDate && selectedService && barber) {
            const service = barber.services.find(s => s.id === selectedService);
            if (service) {
                fetchAvailableSlots(barber.id, selectedService, selectedDate.format("YYYY-MM-DD"))
                    .then(setTimeSlots)
                    .catch(() => setTimeSlots([]));
            }
        } else {
            setTimeSlots([]);
            setSelectedTime(null);
        }
    }, [selectedDate, selectedService, barber]);

    const handleBookAppointment = async () => {
        if (!selectedDate || !selectedTime || !selectedService) {
            setAppointmentError("Выберите дату, время и услугу");
            return;
        }

        // Проверка авторизации
        if (!user) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }

        try {
            await createAppointment({
                serviceId: selectedService,
                barberId: Number(id),
                date: selectedDate.format("YYYY-MM-DD"),
                startTime: selectedTime,
                userId: user.id
            });
            navigate("/appointments");
        } catch (error) {
            console.error("Ошибка записи:", error);
            setAppointmentError("Не удалось записаться. Попробуйте позже.");
        }
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (barberError || !barber) {
        return (
            <Alert severity="error" sx={{ mt: 4 }}>
                {barberError?.message || "Мастер не найден"}
            </Alert>
        );
    }

    return (
        <Box sx={{ maxWidth: "60%", margin: "40px auto", p: 3 }}>
            <Typography variant="h4" gutterBottom>
                {barber.name}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                {barber.specialization || "Барбер"}
            </Typography>

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                Услуги
            </Typography>

            {barber.services && barber.services.length > 0 ? (
                <>
                    <Box sx={{ mb: 4 }}>
                        <FormControl fullWidth>
                            <InputLabel>Выберите услугу</InputLabel>
                            <Select
                                value={selectedService || ''}
                                onChange={(e) => setSelectedService(Number(e.target.value))}
                                label="Выберите услугу"
                            >
                                {barber.services.map((service) => (
                                    <MenuItem key={service.id} value={service.id}>
                                        {service.name} ({service.duration} мин.) - {service.price} ₽
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {selectedService && (
                        <>
                            <Box sx={{ mb: 2 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Выберите дату"
                                        value={selectedDate}
                                        onChange={setSelectedDate}
                                        minDate={dayjs().add(1, 'day')}
                                        maxDate={dayjs().add(30, 'day')}
                                        shouldDisableDate={(date) => {
                                            const dayOfWeek = date.day();
                                            // Проверяем, работает ли барбер в этот день
                                            // В реальном приложении нужно проверять график
                                            return dayOfWeek === 0; // Пример: отключаем воскресенье
                                        }}
                                        sx={{ width: "100%" }}
                                    />
                                </LocalizationProvider>
                            </Box>

                            {selectedDate && timeSlots.length > 0 ? (
                                <Grid container spacing={2} sx={{ mb: 4 }}>
                                    {timeSlots.map((slot, index) => (
                                        <Grid size={{ xs: 8, sm: 6, md: 4 }} key={index}>
                                            <Button
                                                variant={selectedTime === slot.start ? "contained" : "outlined"}
                                                fullWidth
                                                onClick={() => setSelectedTime(slot.start)}
                                            >
                                                {slot.start}
                                            </Button>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : selectedDate ? (
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    Нет доступных слотов на выбранную дату
                                </Alert>
                            ) : null}

                            {user ? (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    size="large"
                                    onClick={handleBookAppointment}
                                >
                                    Записаться на {selectedTime}
                                </Button>
                            ) : (
                                <Alert severity="warning" sx={{ mt: 2 }}>
                                    Для записи необходимо авторизоваться
                                </Alert>
                            )}
                        </>
                    )}
                </>
            ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                    У этого мастера пока нет доступных услуг
                </Alert>
            )}

            {appointmentError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {appointmentError}
                </Alert>
            )}
        </Box>
    );
};

export default BarberDetail;