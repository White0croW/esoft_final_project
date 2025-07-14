import { BarberShop } from "@/types";
import api from "./base";

export const fetchBarbershops = async (params: {
    page?: number;
    limit?: number;
    lat?: number;
    lon?: number;
    popular?: boolean;
    city?: string;
    search?: string;
} = {}) => {
    const {
        page = 1,
        limit = 6,
        lat,
        lon,
        popular = false,
        city,
        search
    } = params;

    const searchParams = new URLSearchParams();
    if (page) searchParams.append("page", page.toString());
    if (limit) searchParams.append("limit", limit.toString());
    if (lat) searchParams.append("lat", lat.toString());
    if (lon) searchParams.append("lon", lon.toString());
    if (popular) searchParams.append("popular", "true");
    if (city) searchParams.append("city", city);
    if (search) searchParams.append("search", search);

    const response = await api.get(`/barbershops?${searchParams.toString()}`);
    return response.data;
};

export const fetchBarbershopById = async (id: number) => {
    const response = await api.get(`/barbershops/${id}`);
    return response.data;
};

// Функция для получения списка городов
export const fetchCities = async () => {
    const response = await api.get("/barbershops/cities");
    return response.data;
};