// src/pages/Home.tsx
import { useEffect, useState } from "react";
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
} from "@mui/material";
import Grid from "@mui/material/Grid";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useAuth } from "../contexts/AuthContext";
import { fetchBarbershops } from "../api/barbershops";
import { fetchPortfolio } from "../api/portfolio";
import { BarberShop, PortfolioItem } from "../types";

// ESM-импорты иконок Leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { NavLink } from "react-router-dom";

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

// Хелпер для расчёта расстояния (в метрах) между двумя точками
function calcDistance(
    [lat1, lon1]: [number, number],
    [lat2, lon2]: [number, number]
) {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371e3; // Метры
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a =
        Math.sin(Δφ / 2) ** 2 +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export default function Home() {
    const { token } = useAuth();
    const [shops, setShops] = useState<BarberShop[]>([]);
    const [displayedShops, setDisplayedShops] = useState<BarberShop[]>([]);
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
    const [center, setCenter] = useState<[number, number]>([55.75, 37.62]); // Москва по умолчанию
    const [addrInput, setAddrInput] = useState("");
    const [addrOptions, setAddrOptions] = useState<DadataSuggestion[]>([]);

    // Загрузка портфолио и всех барбершопов
    useEffect(() => {
        fetchPortfolio().then(setPortfolio).catch(console.error);

        if (!token) {
            // Если пользователь не авторизован — загружаем популярные
            fetchBarbershops({ popular: true })
                .then((data) => setShops(data))
                .catch(console.error);
            return;
        }

        // Получаем текущее местоположение пользователя
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCenter([latitude, longitude]);

                    fetchBarbershops({ lat: latitude, lon: longitude })
                        .then((data) => {
                            setShops(data);
                            setDisplayedShops(data);
                        })
                        .catch(console.error);
                },
                () => {
                    // Не удалось получить местоположение — загружаем популярные
                    fetchBarbershops({ popular: true })
                        .then((data) => {
                            setShops(data);
                            setDisplayedShops(data);
                        })
                        .catch(console.error);
                }
            );
        } else {
            // Браузер не поддерживает геолокацию — загружаем популярные
            fetchBarbershops({ popular: true })
                .then((data) => {
                    setShops(data);
                    setDisplayedShops(data);
                })
                .catch(console.error);
        }
    }, [token]);

    // При изменении центра фильтруем барбершопы в радиусе 5 км
    useEffect(() => {
        const RADIUS_METERS = 5_000;
        const filtered = shops.filter((shop) =>
            calcDistance(center, [shop.lat, shop.lon]) <= RADIUS_METERS
        );
        setDisplayedShops(filtered);
    }, [center, shops]);

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
            console.error("Ошибка запроса к backend:", err);
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

            // Загружаем барбершопы по новым координатам
            fetchBarbershops({ lat: newCenter[0], lon: newCenter[1] })
                .then(setDisplayedShops)
                .catch(console.error);
        } else if (value === null) {
            // Если пользователь очистил поле — загрузите популярные шопы
            fetchBarbershops({ popular: true })
                .then(setDisplayedShops)
                .catch(console.error);
        }
    };

    function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
        const map = useMap();

        useEffect(() => {
            map.setView(center, zoom);
        }, [center, zoom, map]);

        return null;
    }

    return (
        <Container sx={{ mt: 4, mb: 6 }}>
            {/* Портфолио */}
            <Typography variant="h4" gutterBottom>
                Наши работы
            </Typography>
            <Grid container spacing={2} sx={{ mb: 6 }}>
                {portfolio.map((p) => (
                    <Grid size={{ xs: 8, sm: 6, md: 4 }} key={p.id}>
                        <Card sx={{ borderRadius: 2 }}>
                            <CardMedia component="img" height="180" image={p.imageUrl} alt={p.description} />
                            <CardContent>
                                <Typography>{p.description}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Поиск по адресу */}
            <Typography variant="h4" gutterBottom>
                Найдите ближайший барбершоп
            </Typography>
            <Autocomplete<string | DadataSuggestion, false, false, true>
                freeSolo
                filterOptions={(opts) => opts}
                inputValue={addrInput}
                onInputChange={(_, v) => {
                    setAddrInput(v);
                    fetchDadata(v);
                }}
                options={addrOptions}
                getOptionLabel={(opt) => (typeof opt === "string" ? opt : opt.value)}
                onChange={handleAddressChange}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Введите адрес"
                        placeholder="ул. Ленина, 10"
                        sx={{ maxWidth: 400, mb: 2 }}
                    />
                )}
            />

            {/* Карта с барбершопами */}
            <Box sx={{ width: "100%", height: { xs: 300, md: 500 } }}>
                <MapContainer center={center} zoom={12} style={{ width: "100%", height: "100%" }}>
                    <ChangeView center={center} zoom={12} />
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {/* Все маркеры */}
                    {shops.map((s) => (
                        <Marker key={s.id} position={[s.lat, s.lon]}>
                            <Popup>
                                <b>
                                    <NavLink to={`/barbershops/${s.id}`} style={{ color: "inherit" }}>
                                        {s.name}
                                    </NavLink>
                                </b>
                                <br />
                                {s.address}
                            </Popup>
                        </Marker>
                    ))}

                    {/* Фильтрованные маркеры */}
                    {displayedShops.map((s) => (
                        <Marker key={s.id} position={[s.lat, s.lon]}>
                            <Popup>
                                <b>
                                    <NavLink to={`/barbershops/${s.id}`} style={{ color: "inherit" }}>
                                        {s.name}
                                    </NavLink>
                                </b>
                                <br />
                                {s.address}
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </Box>
        </Container>
    );
}
