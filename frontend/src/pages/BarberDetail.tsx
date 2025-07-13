// src/pages/BarberDetail.tsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchBarberById } from "../api/barber";
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
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs, { Dayjs } from "dayjs";
import { createAppointment } from "../api/appointment";

const BarberDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [appointmentError, setAppointmentError] = useState<string | null>(null);

    const {
        data: barber,
        isLoading,
        error: barberError
    } = useQuery<Barber>({
        queryKey: ["barber", id],
        queryFn: () => fetchBarberById(Number(id)),
        enabled: !!id, // Запускать только если id существует
    });

    const handleBookAppointment = async (serviceId: number) => {
        if (!selectedDate) {
            setAppointmentError("Выберите дату и время");
            return;
        }

        try {
            await createAppointment({
                serviceId,
                barberId: Number(id),
                date: selectedDate.format("YYYY-MM-DD"),
                time: selectedDate.format("HH:mm"),
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
        <Box sx={{ p: 3 }}>
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
                <Grid container spacing={3}>
                    {barber.services.map((service) => (
                        <Grid size={{ xs: 8, sm: 6, md: 4 }} key={service.id}>
                            <Card sx={{ height: "100%" }}>
                                <CardContent>
                                    <Typography variant="h6">{service.name}</Typography>
                                    <Typography>Цена: {service.price} ₽</Typography>
                                    <Typography>Длительность: {service.duration} мин.</Typography>

                                    <Box sx={{ mt: 2 }}>
                                        {user ? (
                                            <>
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <DateTimePicker
                                                        label="Выберите дату и время"
                                                        value={selectedDate}
                                                        onChange={setSelectedDate}
                                                        minDate={dayjs().add(1, 'day')}
                                                        maxDate={dayjs().add(30, 'day')}
                                                        sx={{ mb: 2, width: "100%" }}
                                                    />
                                                </LocalizationProvider>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    fullWidth
                                                    onClick={() => handleBookAppointment(service.id)}
                                                    disabled={!selectedDate}
                                                >
                                                    Записаться
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                variant="outlined"
                                                fullWidth
                                                disabled
                                            >
                                                Авторизуйтесь для записи
                                            </Button>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
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