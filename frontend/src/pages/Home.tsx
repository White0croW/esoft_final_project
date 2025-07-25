// src/pages/Home.tsx
import React, { useEffect, useState } from 'react';
import {
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Container,
    TextField,
    Typography,
    IconButton,
    Chip,
    Skeleton,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../contexts/AuthContext';
import { fetchBarbershops } from '../api/barbershops';
import { fetchPortfolio } from '../api/portfolio';
import { BarberShop, PortfolioItem } from '../types';
import { LocationOn, Search, Favorite, ArrowForward } from '@mui/icons-material';
import { NavLink } from 'react-router-dom';

// ESM-импорты иконок Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Конфигурируем маркеры
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

interface DadataSuggestion {
    value: string;
    data: { geo_lat: string; geo_lon: string };
}

export default function Home() {
    const { token } = useAuth();
    const [shops, setShops] = useState<BarberShop[]>([]);
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
    const [center, setCenter] = useState<[number, number]>([55.75, 37.62]); // Москва по умолчанию
    const [addrInput, setAddrInput] = useState("");
    const [addrOptions, setAddrOptions] = useState<DadataSuggestion[]>([]);
    const [loading, setLoading] = useState(true);

    // Загрузка портфолио и всех барбершопов
    useEffect(() => {
        setLoading(true);
        const fetchData = async () => {
            try {
                const portfolioData = await fetchPortfolio();
                setPortfolio(portfolioData);

                // Всегда загружаем все барбершопы
                const allShops = await fetchBarbershops();
                setShops(allShops);

                if (token && navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const { latitude, longitude } = position.coords;
                            setCenter([latitude, longitude]);
                            setLoading(false);
                        },
                        () => {
                            setLoading(false);
                        }
                    );
                } else {
                    setLoading(false);
                }
            } catch (error) {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    // Поиск адреса через Dadata
    const fetchDadata = async (q: string) => {
        if (!q) {
            setAddrOptions([]);
            return;
        }
        try {
            const res = await fetch("/api/suggest/address", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: q }),
            });
            const { suggestions } = await res.json();
            setAddrOptions(suggestions || []);
        } catch (err) {
            console.error("Ошибка поиска адреса:", err);
        }
    };

    const handleAddressChange = (
        _: React.SyntheticEvent,
        value: string | DadataSuggestion | null
    ) => {
        if (typeof value === "string") {
            setAddrInput(value);
            fetchDadata(value);
        } else if (value && "data" in value) {
            const { geo_lat, geo_lon } = value.data;
            const newCenter: [number, number] = [+geo_lat, +geo_lon];
            setCenter(newCenter);
        } else if (value === null) {
            // Возвращаемся к центру по умолчанию при сбросе
            setCenter([55.75, 37.62]);
        }
    };

    // Компонент для изменения вида карты
    const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
        const map = useMap();
        React.useEffect(() => {
            map.setView(center, zoom);
        }, [center, zoom, map]);
        return null;
    };

    return (
        <Container maxWidth="xl" sx={{ mt: { xs: 2, md: 4 }, mb: 6 }}>
            {/* Герой-секция */}
            <Box sx={{
                background: "linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)",
                borderRadius: 4,
                color: "white",
                p: 6,
                mb: 6,
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                "&:before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "url('https://images.unsplash.com/photo-1503951914875-452162b07e57?auto=format&fit=crop&w=1920')",
                    backgroundSize: "cover",
                    opacity: 0.2,
                    zIndex: 0,
                }
            }}>
                <Typography
                    variant="h2"
                    gutterBottom
                    sx={{
                        fontWeight: 800,
                        mb: 2,
                        position: "relative",
                        zIndex: 1,
                        fontSize: { xs: '2.2rem', sm: '3rem', md: '4rem' }
                    }}
                >
                    Найди свой идеальный стиль
                </Typography>
                <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                        fontWeight: 400,
                        mb: 4,
                        maxWidth: 800,
                        mx: "auto",
                        position: "relative",
                        zIndex: 1,
                        fontSize: { xs: '1.1rem', sm: '1.3rem' }
                    }}
                >
                    Лучшие барберы города готовы создать для вас неповторимый образ
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    href="#barbershops"
                    sx={{
                        bgcolor: "white",
                        color: "#1a2a6c",
                        fontWeight: 700,
                        py: 1.5,
                        px: 4,
                        borderRadius: 3,
                        fontSize: "1.1rem",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                        "&:hover": {
                            bgcolor: "#f5f5f5",
                            transform: "translateY(-2px)",
                        },
                        position: "relative",
                        zIndex: 1,
                    }}
                >
                    Найти барбершоп
                </Button>
            </Box>
            {/* Портфолио */}
            <Typography
                variant="h3"
                gutterBottom
                sx={{
                    fontWeight: 700,
                    mb: 4,
                    textAlign: 'center',
                    color: 'text.primary'
                }}
            >
                Наши работы
            </Typography>
            {loading ? (
                <Grid container spacing={3} sx={{ mb: 6 }}>
                    {[...Array(3)].map((_, i) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Grid container spacing={3} sx={{ mb: 6 }}>
                    {portfolio.slice(0, 3).map((p) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={p.id}>
                            <Card sx={{
                                height: "100%",
                                borderRadius: 3,
                                boxShadow: 3,
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    transform: "translateY(-8px)",
                                    boxShadow: "0 12px 28px rgba(0,0,0,0.2)"
                                }
                            }}>
                                <CardMedia
                                    component="img"
                                    height="300"
                                    image={p.imageUrl}
                                    alt={p.description}
                                    sx={{ objectFit: "cover" }}
                                />
                                <CardContent sx={{ p: 3 }}>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        sx={{
                                            fontWeight: 600,
                                            display: "flex",
                                            alignItems: "center"
                                        }}
                                    >
                                        <Favorite color="error" sx={{ mr: 1 }} />
                                        {p.description}
                                    </Typography>
                                    <Box sx={{ display: "flex", mt: 2 }}>
                                        <Chip label="Мужские стрижки" size="small" sx={{ mr: 1 }} />
                                        <Chip label="Борода" size="small" />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
            {/* Поиск барбершопов */}
            <Box id="barbershops" sx={{ mb: 6 }}>
                <Typography
                    variant="h3"
                    gutterBottom
                    sx={{
                        fontWeight: 700,
                        mb: 4,
                        textAlign: "center",
                        color: "text.primary"
                    }}
                >
                    Найдите ближайший барбершоп
                </Typography>
                <Box sx={{
                    maxWidth: 800,
                    mx: "auto",
                    mb: 4,
                    p: 3,
                    bgcolor: "background.paper",
                    borderRadius: 3,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.05)"
                }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            mb: 2,
                            display: "flex",
                            alignItems: "center"
                        }}
                    >
                        <LocationOn color="primary" sx={{ mr: 1 }} />
                        Укажите ваш адрес для поиска
                    </Typography>
                    <Autocomplete
                        freeSolo
                        options={addrOptions}
                        getOptionLabel={(option) => typeof option === "string" ? option : option.value}
                        inputValue={addrInput}
                        onInputChange={(_, v) => {
                            setAddrInput(v);
                            fetchDadata(v);
                        }}
                        onChange={handleAddressChange}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Введите адрес"
                                placeholder="ул. Ленина, 10"
                                fullWidth
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: <Search sx={{ color: "text.secondary", mr: 1 }} />,
                                    sx: {
                                        borderRadius: 3,
                                        bgcolor: "background.default",
                                    }
                                }}
                            />
                        )}
                        renderOption={(props, option) => (
                            <Box component="li" {...props}>
                                {typeof option === "string" ? option : option.value}
                            </Box>
                        )}
                    />
                </Box>
                {/* Карта с барбершопами */}
                <Box
                    sx={{
                        width: "100%",
                        height: { xs: 400, md: 600 },
                        borderRadius: 3,
                        overflow: "hidden",
                        boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
                        border: "1px solid rgba(0,0,0,0.08)",
                        mb: 4
                    }}
                >
                    <MapContainer
                        center={center}
                        zoom={12}
                        style={{ width: "100%", height: "100%" }}
                    >
                        <ChangeView center={center} zoom={12} />
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href=" https://www.openstreetmap.org/copyright ">OpenStreetMap</a> contributors'
                        />
                        {/* Маркеры всех барбершопов */}
                        {shops.map((s) => (
                            <Marker
                                key={s.id}
                                position={[s.lat, s.lon]}
                            >
                                <Popup>
                                    <Box sx={{ minWidth: 200, p: 1 }}>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ fontWeight: 700, mb: 1 }}
                                        >
                                            <NavLink to={`/barbershops/${s.id}`} style={{ color: "#1a2a6c", textDecoration: "none" }}>
                                                {s.name}
                                            </NavLink>
                                        </Typography>
                                        <Typography variant="body2">
                                            {s.address}
                                        </Typography>
                                    </Box>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </Box>
                {/* Кнопка "Показать все" */}
                <Box sx={{ textAlign: "center" }}>
                    <Button
                        variant="outlined"
                        size="large"
                        endIcon={<ArrowForward />}
                        href="/barbershops"
                        sx={{
                            fontWeight: 600,
                            py: 1.5,
                            px: 6,
                            borderRadius: 2,
                            borderWidth: 2,
                            "&:hover": {
                                borderWidth: 2,
                            }
                        }}
                    >
                        Показать все барбершопы
                    </Button>
                </Box>
            </Box>
            {/* Призыв к действию */}
            <Box sx={{
                bgcolor: "background.paper",
                borderRadius: 3,
                p: 5,
                textAlign: "center",
                boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
                mb: 6
            }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                    Готовы к новой стрижке?
                </Typography>
                <Typography variant="h6" sx={{ mb: 4, maxWidth: 600, mx: "auto" }}>
                    Запишитесь онлайн к лучшим барберам города прямо сейчас
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    href="/barbershops"
                    sx={{
                        background: "linear-gradient(45deg, #1a2a6c 30%, #b21f1f 90%)",
                        color: "white",
                        fontWeight: 700,
                        py: 1.5,
                        px: 6,
                        borderRadius: 3,
                        boxShadow: "0 8px 20px rgba(26, 42, 108, 0.3)",
                        "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 12px 28px rgba(26, 42, 108, 0.4)"
                        }
                    }}
                >
                    Записаться онлайн
                </Button>
            </Box>
        </Container>
    );
}