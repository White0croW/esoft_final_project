// src/api/barbershops.ts
import { BarberShop } from "@/types";
import api from "./base";

export const fetchBarbershops = async ({
    page = 1,
    limit = 6,
    lat,
    lon,
    popular = false,
}: {
    page?: number;
    limit?: number;
    lat?: number;
    lon?: number;
    popular?: boolean;
}) => {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());
    if (lat) params.append("lat", lat.toString());
    if (lon) params.append("lon", lon.toString());
    if (popular) params.append("popular", "true");

    const response = await api.get(`/barbershops?${params.toString()}`);
    return response.data;
};

export const fetchBarbershopById = async (id: number): Promise<BarberShop> => {
    const response = await api.get(`/barbershops/${id}`);
    return response.data;
};