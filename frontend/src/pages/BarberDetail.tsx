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
    Typography,
    Button,
    Box,
    CircularProgress,
    Alert,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Snackbar,
    Card,
    CardContent,
    Avatar,
    Chip,
    Divider,
    Paper,
    useTheme
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { createAppointment } from "../api/appointment";
import { CalendarToday, Schedule, Style, MonetizationOn } from "@mui/icons-material";

interface TimeSlot {
    start: string;
    end: string;
}

const BarberDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [selectedService, setSelectedService] = useState<number | null>(null);
    const theme = useTheme();

    // Состояние для управления Snackbar
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error",
    });

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
            setSnackbar({
                open: true,
                message: "Выберите дату, время и услугу",
                severity: "error",
            });
            return;
        }

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

            setSnackbar({
                open: true,
                message: "Запись успешно создана!",
                severity: "success",
            });

            setSelectedTime(null);
            setSelectedDate(null);

        } catch (error) {
            console.error("Ошибка записи:", error);
            setSnackbar({
                open: true,
                message: "Не удалось записаться. Попробуйте позже.",
                severity: "error",
            });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" mt={10}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (barberError || !barber) {
        return (
            <Box sx={{ maxWidth: "800px", margin: "40px auto", p: 3 }}>
                <Alert severity="error" sx={{ mt: 4, borderRadius: 2 }}>
                    {barberError?.message || "Мастер не найден"}
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: "800px", margin: "40px auto", p: { xs: 2, md: 3 } }}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
                <CardContent>
                    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 3, alignItems: "center" }}>
                        <Avatar
                            src={barber.imageUrl || "/default-barber.jpg"}
                            sx={{
                                width: 120,
                                height: 120,
                                border: `3px solid ${theme.palette.primary.main}`
                            }}
                        />
                        <Box>
                            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                                {barber.name}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                <Chip
                                    label={`★ ${barber.rating}`}
                                    color="primary"
                                    size="small"
                                    sx={{ fontWeight: 600 }}
                                />
                            </Box>
                            <Typography variant="body1" sx={{ maxWidth: "600px" }}>
                                {barber.bio || "Профессиональный барбер с индивидуальным подходом к каждому клиенту"}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h5" gutterBottom sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                <Style fontSize="large" color="primary" /> Услуги и запись
            </Typography>

            {barber.services && barber.services.length > 0 ? (
                <Box>
                    <Card sx={{ borderRadius: 3, mb: 4, boxShadow: 2 }}>
                        <CardContent>
                            <FormControl fullWidth>
                                <InputLabel sx={{ fontWeight: 500 }}>Выберите услугу</InputLabel>
                                <Select
                                    value={selectedService || ''}
                                    onChange={(e) => setSelectedService(Number(e.target.value))}
                                    label="Выберите услугу"
                                    sx={{ borderRadius: 2 }}
                                >
                                    {barber.services.map((service) => (
                                        <MenuItem key={service.id} value={service.id} sx={{ py: 1.5 }}>
                                            <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                                <Typography variant="body1" fontWeight={500}>
                                                    {service.name}
                                                </Typography>
                                                <Box sx={{ display: "flex", gap: 2 }}>
                                                    <Chip
                                                        label={`${service.duration} мин`}
                                                        size="small"
                                                        icon={<Schedule fontSize="small" />}
                                                    />
                                                    <Chip
                                                        label={`${service.price} ₽`}
                                                        color="primary"
                                                        size="small"
                                                        icon={<MonetizationOn fontSize="small" />}
                                                    />
                                                </Box>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </CardContent>
                    </Card>

                    {selectedService && (
                        <>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Card sx={{ borderRadius: 3, boxShadow: 2, height: "100%" }}>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                                <CalendarToday color="primary" /> Выберите дату
                                            </Typography>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                    value={selectedDate}
                                                    onChange={setSelectedDate}
                                                    minDate={dayjs().add(1, 'day')}
                                                    maxDate={dayjs().add(30, 'day')}
                                                    shouldDisableDate={(date) => date.day() === 0}
                                                    slotProps={{
                                                        textField: {
                                                            fullWidth: true,
                                                            variant: "outlined",
                                                            sx: { borderRadius: 2 }
                                                        }
                                                    }}
                                                />
                                            </LocalizationProvider>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {selectedDate && (
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Card sx={{ borderRadius: 3, boxShadow: 2, height: "100%" }}>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                                    <Schedule color="primary" /> Доступное время
                                                </Typography>
                                                {timeSlots.length > 0 ? (
                                                    <Grid container spacing={1}>
                                                        {timeSlots.map((slot, index) => (
                                                            <Grid size={{ xs: 6, md: 4 }} key={index}>
                                                                <Button
                                                                    variant={selectedTime === slot.start ? "contained" : "outlined"}
                                                                    fullWidth
                                                                    onClick={() => setSelectedTime(slot.start)}
                                                                    sx={{
                                                                        borderRadius: 2,
                                                                        py: 1.5,
                                                                        fontWeight: selectedTime === slot.start ? 600 : 500,
                                                                        boxShadow: selectedTime === slot.start ? 2 : 0,
                                                                        transition: "all 0.2s ease",
                                                                        "&:hover": {
                                                                            transform: "translateY(-2px)",
                                                                            boxShadow: 2
                                                                        }
                                                                    }}
                                                                >
                                                                    {slot.start}
                                                                </Button>
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                ) : (
                                                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                                                        Нет доступных слотов на выбранную дату
                                                    </Alert>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                )}
                            </Grid>

                            <Box sx={{ mt: 4 }}>
                                {user ? (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        size="large"
                                        onClick={handleBookAppointment}
                                        disabled={!selectedTime}
                                        sx={{
                                            py: 2,
                                            borderRadius: 2,
                                            fontSize: "1.1rem",
                                            fontWeight: 600,
                                            boxShadow: 3,
                                            "&:hover": {
                                                boxShadow: 5,
                                                transform: "translateY(-2px)"
                                            },
                                            "&:disabled": {
                                                opacity: 0.7
                                            }
                                        }}
                                    >
                                        {selectedTime
                                            ? `Записаться на ${selectedTime}`
                                            : "Выберите время"}
                                    </Button>
                                ) : (
                                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                                        Для записи необходимо авторизоваться
                                    </Alert>
                                )}
                            </Box>
                        </>
                    )}
                </Box>
            ) : (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                    У этого мастера пока нет доступных услуг
                </Alert>
            )}

            {/* Snackbar для уведомлений */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{
                        width: "100%",
                        borderRadius: 2,
                        boxShadow: 3
                    }}
                >
                    <Typography fontWeight={500}>{snackbar.message}</Typography>
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default BarberDetail;