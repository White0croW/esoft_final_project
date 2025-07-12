// src/api/barbershops.ts
import { BarberShop } from "@/types";
import api from "./base";

export const fetchBarbershops = async (params: {
    page?: number;
    limit?: number;
    lat?: number;
    lon?: number;
    popular?: boolean;
} = {}) => {
    const { page = 1, limit = 6, lat, lon, popular = false } = params;
    const search = new URLSearchParams();
    if (page) search.append("page", page.toString());
    if (limit) search.append("limit", limit.toString());
    if (lat) search.append("lat", lat.toString());
    if (lon) search.append("lon", lon.toString());
    if (popular) search.append("popular", "true");

    const response = await api.get(`/barbershops?${search.toString()}`);
    return response.data;
};

export const fetchBarbershopById = async (id: number) => {
    const response = await api.get(`/barbershops/${id}`);
    return response.data;
};