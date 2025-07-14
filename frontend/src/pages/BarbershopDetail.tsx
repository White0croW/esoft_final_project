// src/pages/BarbershopDetail.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchBarbershopById } from '../api/barbershops';
import { BarberShop, Barber } from '../types';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Box,
    Container,
    Avatar,
    Divider,
    Chip,
    Skeleton,
    Rating
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import PeopleIcon from '@mui/icons-material/People';
import { deepPurple } from '@mui/material/colors';

export default function BarbershopDetail() {
    const { id } = useParams();
    const { data: barbershop, isLoading, isError } = useQuery<BarberShop>({
        queryKey: ['barbershop', id],
        queryFn: () => fetchBarbershopById(Number(id)),
    });

    if (isLoading) return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Skeleton variant="rectangular" width="60%" height={40} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="40%" height={24} sx={{ mb: 4 }} />
            <Grid container spacing={3}>
                {[1, 2, 3].map(item => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item}>
                        <Skeleton variant="rectangular" height={200} />
                    </Grid>
                ))}
            </Grid>
        </Container>
    );

    if (isError || !barbershop) return (
        <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="h5" color="error" sx={{ mb: 2 }}>
                Ошибка загрузки данных
            </Typography>
            <Button variant="contained" onClick={() => window.location.reload()}>
                Попробовать снова
            </Button>
        </Container>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Заголовок и основная информация */}
            <Box sx={{
                mb: 4,
                p: 3,
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center'
            }}>
                <Avatar
                    sx={{
                        width: 80,
                        height: 80,
                        mr: 3,
                        bgcolor: deepPurple[500],
                        fontSize: '2rem'
                    }}
                >
                    {barbershop.name.charAt(0)}
                </Avatar>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        {barbershop.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body1" color="text.secondary">
                            {barbershop.address}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating
                            value={4.5}
                            precision={0.5}
                            readOnly
                            emptyIcon={<StarIcon style={{ opacity: 0.5 }} fontSize="inherit" />}
                            sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                            (142 отзыва)
                        </Typography>
                    </Box>
                </Box>
            </Box>
            <Divider sx={{ my: 3 }} />
            {/* Заголовок мастеров */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 3,
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
            }}>
                <PeopleIcon color="primary" sx={{ mr: 2, fontSize: 32 }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Наши мастера
                </Typography>
                <Chip
                    label={`${barbershop.barbers.length} мастеров`}
                    color="primary"
                    size="small"
                    sx={{ ml: 2 }}
                />
            </Box>
            {/* Список мастеров */}
            {barbershop.barbers.length > 0 ? (
                <Grid container spacing={3}>
                    {barbershop.barbers.map((barber: Barber) => (
                        <Grid size={{ xs: 8, sm: 6, md: 4 }} key={barber.id}>
                            <Card sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: 2,
                                boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
                                transition: 'transform 0.3s, box-shadow 0.3s',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                                }
                            }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Avatar
                                            sx={{
                                                width: 56,
                                                height: 56,
                                                mr: 2,
                                                bgcolor: deepPurple[500]
                                            }}
                                        >
                                            {barber.name.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                {barber.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {barber.specialization || "Барбер"}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Rating
                                            value={barber.rating || 4.7}
                                            precision={0.5}
                                            readOnly
                                            size="small"
                                        />
                                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                            {barber.rating || "4.7"}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {["Мужские стрижки", "Борода", "Детские"].map((skill, index) => (
                                            <Chip
                                                key={index}
                                                label={skill}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        ))}
                                    </Box>
                                </CardContent>
                                <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        href={`/barbers/${barber.id}`}
                                        sx={{
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            borderRadius: 2,
                                            px: 3,
                                            py: 1
                                        }}
                                    >
                                        Выбрать мастера
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Box sx={{
                    textAlign: 'center',
                    p: 4,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                    <PeopleIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        В этом барбершопе пока нет мастеров
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Попробуйте проверить позже или выберите другой барбершоп
                    </Typography>
                    <Button
                        variant="outlined"
                        color="primary"
                        href="/barbershops"
                        sx={{ borderRadius: 2, px: 4, py: 1 }}
                    >
                        Найти другой барбершоп
                    </Button>
                </Box>
            )}
            {/* Дополнительная информация */}
            <Box sx={{ mt: 6, p: 4, bgcolor: 'background.paper', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                    О барбершопе
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    {barbershop.description || "Премиальный барбершоп в центре города, где работают настоящие профессионалы своего дела. Мы предлагаем полный спектр услуг для мужчин: от классических стрижек до современных укладок и ухода за бородой."}
                </Typography>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                            Часы работы
                        </Typography>
                        <Typography variant="body1">Пн-Пт: </Typography>
                        <Typography variant="body1">Сб-Вс: 10:00 - 20:00</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                            Контакты
                        </Typography>
                        <Typography variant="body1">Телефон: +7 (999) 123-45-67</Typography>
                        <Typography variant="body1">Email: info@{barbershop.name.toLowerCase().replace(/\s+/g, '')}.com</Typography>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
}