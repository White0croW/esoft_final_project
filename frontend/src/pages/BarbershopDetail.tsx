import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchBarbershopById } from "../api/barbershops";
import { BarberShop, Barber } from "../types";
import { Grid, Card, CardContent, Typography, Button } from "@mui/material";

const BarbershopDetail: React.FC = () => {
    const { id } = useParams();
    const { data: barbershop, isLoading, isError } = useQuery<BarberShop>({
        queryKey: ["barbershop", id],
        queryFn: () => fetchBarbershopById(Number(id)),
    });

    if (isLoading) return <div>Загрузка...</div>;
    if (isError) return <div>Ошибка загрузки</div>;

    return (
        <div>
            <Typography variant="h4">{barbershop?.name}</Typography>
            <Typography>{barbershop?.address}</Typography>
            <Typography>Мастера:</Typography>
            <Grid container spacing={3}>
                {barbershop?.barbers.map((barber: Barber) => (
                    <Grid size={{ xs: 8, sm: 6, md: 4 }} key={barber.id}>
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
                {barbershop?.barbers.length === 0 && (
                    <Grid size={{ xs: 8 }}>
                        <Card>
                            <CardContent>
                                <Typography>В этом барбершопе нет мастеров</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>
        </div>
    );
};

export default BarbershopDetail;