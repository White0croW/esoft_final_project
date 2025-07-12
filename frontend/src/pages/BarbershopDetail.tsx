// src/pages/BarbershopDetail.tsx
import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchBarbershopById } from "../api/barbershops";
import { BarberShop } from "../types";
import { Grid as Grid, Card, CardContent, Typography, Button } from "@mui/material";

const BarbershopDetail: React.FC = () => {
    const { id } = useParams();
    const { data: barbershop, isLoading } = useQuery<BarberShop | undefined>({
        queryKey: ["barbershop", id],
        queryFn: () => fetchBarbershopById(Number(id)),
        initialData: undefined,
    });

    if (isLoading) return <div>Загрузка...</div>;

    return (
        <div>
            <Typography variant="h4">{barbershop?.name || "—"}</Typography>
            <Typography>{barbershop?.address || "—"}</Typography>
            <Typography>Мастера:</Typography>
            <Grid container spacing={3}>
                {barbershop?.barbers.map((barber) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={barber.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{barber.name}</Typography>
                                <Typography>{barber.specialization}</Typography>
                            </CardContent>
                            <Button component="a" href={`/barbers/${barber.id}`}>
                                Услуги
                            </Button>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </div>
    );
};

export default BarbershopDetail;