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
    TextField,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs, { Dayjs } from "dayjs";

// Исправленный импорт
import { createAppointment } from "../api/appointment";

const BarberDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();

    const { data: barber, isLoading } = useQuery<Barber>({
        queryKey: ["barber", id],
        queryFn: () => fetchBarberById(Number(id)),
    });

    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

    if (isLoading) return <div>Загрузка...</div>;

    return (
        <div>
            <Typography variant="h4">{barber?.name || "—"}</Typography>
            <Typography>{barber?.specialization || "—"}</Typography>
            <Typography>Услуги:</Typography>
            <Grid container spacing={3}>
                {barber?.services.map((service: Service) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={service.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{service.name}</Typography>
                                <Typography>Цена: {service.price} ₽</Typography>
                                <Typography>Длительность: {service.duration} мин.</Typography>
                            </CardContent>
                            {user ? (
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DateTimePicker
                                        label="Выберите дату и время"
                                        value={selectedDate}
                                        onChange={(newDate: Dayjs | null) => setSelectedDate(newDate)}
                                    />
                                    <Button
                                        onClick={() =>
                                            createAppointment({
                                                serviceId: service.id,
                                                barberId: Number(id),
                                                date: selectedDate?.format("YYYY-MM-DD") || "2023-10-05",
                                                time: selectedDate?.format("HH:mm") || "15:00",
                                            }).then(() => navigate("/appointments"))
                                        }
                                    >
                                        Записаться
                                    </Button>
                                </LocalizationProvider>
                            ) : (
                                <Button disabled>Авторизуйтесь для записи</Button>
                            )}
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </div>
    );
};

export default BarberDetail;