// src/pages/Home.tsx
import { useEffect, useState } from "react";
import {
    Autocomplete,
    Box,
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
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useAuth } from "../contexts/AuthContext";
import { fetchBarbershops } from "../api/barbershops";
import { fetchPortfolio } from "../api/portfolio";
import { BarberShop, PortfolioItem } from "../types";

// ESM-импорты иконок Leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

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
    const [center, setCenter] = useState<[number, number]>([55.75, 37.62]);

    const [addrInput, setAddrInput] = useState("");
    const [addrOptions, setAddrOptions] = useState<DadataSuggestion[]>([]);

    // Загрузка портфолио и всех барбершопов
    useEffect(() => {
        fetchPortfolio().then(setPortfolio).catch(console.error);
        if (token) {
            fetchBarbershops()
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

    // Вызов вашего бэкенд-прокси для Dadata
    const fetchDadata = async (q: string) => {
        if (!q) {
            setAddrOptions([]);
            return;
        }
        try {
            const res = await fetch("http://localhost:4000/api/suggest/address", {
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

    return (
        <Container sx={{ mt: 4, mb: 6 }}>
            {/* Портфолио */}
            <Typography variant="h4" gutterBottom>
                Наши работы
            </Typography>
            <Grid container spacing={2} sx={{ mb: 6 }}>
                {portfolio.map((p) => (
                    <Grid key={p.id}>
                        <Card>
                            <CardMedia
                                component="img"
                                height="180"
                                image={p.imageUrl}
                                alt={p.description}
                            />
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
                getOptionLabel={(opt) =>
                    typeof opt === "string" ? opt : opt.value
                }
                onChange={(_, opt) => {
                    if (opt && typeof opt !== "string") {
                        const { geo_lat, geo_lon } = opt.data;
                        setCenter([+geo_lat, +geo_lon]);
                    }
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Введите адрес"
                        placeholder="ул. Ленина, 10"
                        sx={{ maxWidth: 400, mb: 2 }}
                    />
                )}
            />

            {/* Карта с отфильтрованными точками */}
            <Box sx={{ width: "100%", height: { xs: 300, md: 500 } }}>
                <MapContainer
                    center={center}
                    zoom={12}
                    style={{ width: "100%", height: "100%" }}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {displayedShops.map((s) => (
                        <Marker key={s.id} position={[s.lat, s.lon]}>
                            <Popup>
                                <b>{s.name}</b>
                                <br />
                                {s.masterName}
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
