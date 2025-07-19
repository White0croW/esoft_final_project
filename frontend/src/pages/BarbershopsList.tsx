import React, { useState, useEffect } from "react";
import {
    Grid, Card, CardMedia, CardContent, Typography, Button, Pagination,
    Box, Stack, Skeleton, InputAdornment, TextField, MenuItem, Select,
    FormControl, InputLabel
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { fetchBarbershops, fetchCities } from "../api/barbershops";
import { BarberShop } from "../types";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';

const ITEMS_PER_PAGE = 6;

export default function BarbershopsList() {
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [cities, setCities] = useState<string[]>([]);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

    // Исправленный useQuery
    const {
        data: barbershops = [],
        isLoading,
        isFetching
    } = useQuery<BarberShop[], Error>({
        queryKey: ["barbershops", page, userLocation, selectedCity, searchQuery],
        queryFn: () =>
            fetchBarbershops({
                page,
                limit: ITEMS_PER_PAGE,
                lat: userLocation?.[0],
                lon: userLocation?.[1],
                popular: !userLocation && !selectedCity,
                city: selectedCity || undefined,
                search: searchQuery || undefined
            })
    });

    // Запрос геолокации
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                () => {
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

    // Рассчитываем общее количество страниц
    const pageCount = barbershops.length > 0 ? Math.ceil(barbershops.length / ITEMS_PER_PAGE) : 0;

    return (
        <Box sx={{ maxWidth: { xs: "95%", md: "85%", lg: "75%" }, margin: "40px auto", px: 2 }}>
            {/* Заголовок и фильтры */}
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 3,
                mb: 4,
                alignItems: 'center'
            }}>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                            fontWeight: 700,
                            color: 'text.primary',
                            textAlign: { xs: 'center', sm: 'left' },
                            fontSize: { xs: '1.8rem', sm: '2.2rem' }
                        }}
                    >
                        {userLocation && !selectedCity ? "Ближайшие барбершопы" : "Наши барбершопы"}
                    </Typography>
                </Box>

                <Box sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    justifyContent: { xs: 'center', sm: 'flex-end' }
                }}>
                    {/* Поиск по названию */}
                    <TextField
                        placeholder="Поиск по названию"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            minWidth: 250,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                height: 48
                            }
                        }}
                    />
                </Box>
            </Box>

            {/* Список карточек */}
            {(isLoading || isFetching) ? (
                <Grid container spacing={3}>
                    {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                            <Card sx={{
                                height: "100%",
                                borderRadius: 3,
                                boxShadow: 3,
                                overflow: 'hidden'
                            }}>
                                <Skeleton variant="rectangular" height={180} />
                                <CardContent>
                                    <Skeleton variant="text" width="80%" height={32} />
                                    <Skeleton variant="text" width="60%" height={24} />
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                        <Skeleton variant="circular" width={24} height={24} />
                                        <Skeleton variant="text" width="40%" sx={{ ml: 1 }} />
                                    </Box>
                                    <Skeleton
                                        variant="rectangular"
                                        width="100%"
                                        height={40}
                                        sx={{ mt: 2, borderRadius: 2 }}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : barbershops.length === 0 ? (
                <Box textAlign="center" py={4}>
                    <LocationOnIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        Барбершопы не найдены
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                        Попробуйте изменить параметры поиска
                    </Typography>
                </Box>
            ) : (
                <>
                    <Grid container spacing={3}>
                        {barbershops.map((barbershop: BarberShop) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={barbershop.id}>
                                <Card
                                    sx={{
                                        height: "100%",
                                        borderRadius: 3,
                                        boxShadow: 3,
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            transform: "translateY(-5px)",
                                            boxShadow: 6
                                        },
                                        display: 'flex',
                                        flexDirection: 'column',
                                        width: '100%',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <Box sx={{ position: 'relative' }}>
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={`https://picsum.dev//static/${barbershop.id}400/250`}
                                            alt={barbershop.name}
                                            sx={{
                                                objectFit: "cover",
                                                width: '100%',
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                height: '60%',
                                                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                                            }}
                                        />
                                    </Box>
                                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                        <Typography
                                            variant="h5"
                                            gutterBottom
                                            sx={{
                                                fontWeight: 700,
                                                color: 'text.primary',
                                                mb: 1.5
                                            }}
                                        >
                                            {barbershop.name}
                                        </Typography>

                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2.5 }}>
                                            <LocationOnIcon
                                                fontSize="small"
                                                sx={{
                                                    color: 'primary.main',
                                                    mr: 1,
                                                    mt: 0.5
                                                }}
                                            />
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: 'text.secondary',
                                                    lineHeight: 1.4
                                                }}
                                            >
                                                {barbershop.address}
                                            </Typography>
                                        </Box>

                                        <Button
                                            variant="contained"
                                            fullWidth
                                            href={`/barbershops/${barbershop.id}`}
                                            sx={{
                                                mt: 'auto',
                                                py: 1.5,
                                                borderRadius: 2,
                                                fontWeight: 600,
                                                background: 'linear-gradient(45deg, #1a2a6c 30%, #b21f1f 90%)',
                                                '&:hover': {
                                                    transform: 'scale(1.02)',
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                                                }
                                            }}
                                        >
                                            Подробнее
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Пагинация */}
                    <Stack spacing={2} sx={{ mt: 6, mb: 4, alignItems: "center" }}>
                        <Pagination
                            count={pageCount}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                            shape="rounded"
                            size="large"
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    fontSize: '1rem',
                                    fontWeight: 600
                                },
                                '& .Mui-selected': {
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                }
                            }}
                        />
                    </Stack>
                </>
            )}
        </Box>
    );
}