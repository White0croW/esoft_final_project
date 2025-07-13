// src/api/barber.ts
import api from "./base";

export const fetchBarberById = async (id: number) => {
    const response = await api.get(`/barbers/${id}`);
    return response.data;
};

export const fetchAvailableSlots = async (
    barberId: number,
    serviceId: number,
    date: string
) => {
    const response = await api.get(
        `/barbers/${barberId}/available-slots`,
        { params: { serviceId, date } }
    );
    return response.data;
};