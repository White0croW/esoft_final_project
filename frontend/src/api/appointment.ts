// src/api/appointment.ts
import api from "./base";

export const createAppointment = async (data: {
    serviceId: number;
    barberId: number;
    date: string;
    time: string;
}) => {
    const response = await api.post("/appointments", data);
    return response.data;
};