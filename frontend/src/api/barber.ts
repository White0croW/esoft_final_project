// src/api/barber.ts
import api from "./base";

export const fetchBarberById = async (id: number) => {
    const response = await api.get(`/barbers/${id}`);
    return response.data;
};