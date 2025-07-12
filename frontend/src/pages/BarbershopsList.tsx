// src/pages/BarbershopsList.tsx
import React, { useState, useEffect } from "react";
import {
    Grid,
    Card,
    CardMedia,
    CardContent,
    Typography,
    Button,
    Pagination,
    Box,
    Stack,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { fetchBarbershops } from "../api/barbershops";
import { BarberShop } from "../types";

const ITEMS_PER_PAGE = 6;

export default function BarbershopsList() {
    const [page, setPage] = useState(1);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const { data: barbershops = [], isLoading } = useQuery<BarberShop[]>({
        queryKey: ["barbershops", page, userLocation],
        queryFn: () =>
            fetchBarbershops({
                page,
                limit: ITEMS_PER_PAGE,
                lat: userLocation?.[0],
                lon: userLocation?.[1],
                popular: !userLocation,
            }),
        initialData: [],
    });

    // Запрос геолокации
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                () => {
                    console.error("Не удалось получить местоположение");
                    setUserLocation(null);
                }
            );
        } else {
            setUserLocation(null);
        }
    }, []);

    const handlePageChange = (
        event: React.ChangeEvent<unknown>,
        value: number
    ) => {
        setPage(value);
    };

    if (isLoading) return <div>Загрузка...</div>;

    return (
        <Box sx={{ maxWidth: "80%", margin: "40px auto", mt: 4, px: 2 }}>
            {/* Заголовок */}
            <Typography variant="h4" gutterBottom>
                {userLocation ? "Ближайшие барбершопы" : "Популярные барбершопы"}
            </Typography>

            {/* Список карточек */}
            <Grid container spacing={3}>
                {barbershops.map((barbershop) => (
                    <Grid size={{ xs: 8, sm: 6, md: 4 }} key={barbershop.id}>
                        <Card
                            sx={{
                                height: "100%",
                                borderRadius: 8,
                                boxShadow: 3,
                                transition: "transform 0.2s",
                                "&:hover": { transform: "scale(1.02)" },
                            }}
                        >
                            <CardMedia
                                component="img"
                                height="180"
                                image={`https://picsum.dev//static/${barbershop.id}400/250`}
                                alt={barbershop.name}
                                sx={{ objectFit: "cover" }}
                            />
                            <CardContent>
                                <Typography variant="h5" gutterBottom>
                                    {barbershop.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {barbershop.address}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    href={`/barbershops/${barbershop.id}`}
                                    sx={{ mt: 2 }}
                                >
                                    Подробнее
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Пагинация */}
            <Stack spacing={2} sx={{ mt: 4, mb: 8, alignItems: "center" }}>
                <Pagination
                    count={Math.ceil(barbershops.length / ITEMS_PER_PAGE)}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    shape="rounded"
                />
            </Stack>
        </Box>
    );
}