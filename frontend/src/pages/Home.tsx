// src/pages/Home.tsx
import React, { useEffect, useState } from "react";
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
import Grid from "@mui/material/Grid";      // Grid2 API
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useAuth } from "../contexts/AuthContext";
import { getBarbershops } from "../api/barbershops";
import { getPortfolio } from "../api/portfolio";
import { BarberShop, PortfolioItem } from "../types";

// ESM-импорты иконок Leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Настраиваем дефолтную иконку
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
    const [center, setCenter] = useState<[number, number]>([55.75, 37.62]);

    const [addrInput, setAddrInput] = useState("");
    const [addrOptions, setAddrOptions] = useState<DadataSuggestion[]>([]);

    useEffect(() => {
        getPortfolio().then(setPortfolio).catch(console.error);
        if (token) getBarbershops(token).then(setShops).catch(console.error);
    }, [token]);

    const fetchDadata = async (q: string) => {
        if (!q) {
            setAddrOptions([]);
            return;
        }
        try {
            const res = await fetch(
                "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${import.meta.env.VITE_DADATA_TOKEN}`,
                    },
                    body: JSON.stringify({ query: q, count: 5 }),
                }
            );
            const { suggestions } = await res.json();
            setAddrOptions(suggestions);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Container sx={{ mt: 4, mb: 6 }}>
            <Typography variant="h4" gutterBottom>
                Наши работы
            </Typography>
            <Grid container spacing={2} mb={6}>
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

            <Typography variant="h4" gutterBottom>
                Найдите ближайший барбершоп
            </Typography>
            <Autocomplete<DadataSuggestion, false, false, true>
                freeSolo
                inputValue={addrInput}
                onInputChange={(_, v) => {
                    setAddrInput(v);
                    fetchDadata(v);
                }}
                options={addrOptions}
                getOptionLabel={(opt) => opt.value}
                onChange={(_, opt) => {
                    if (opt) {
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

            <Box sx={{ width: "100%", height: { xs: 300, md: 500 } }}>
                <MapContainer center={center} zoom={12} style={{ height: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {shops.map((s) => (
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
