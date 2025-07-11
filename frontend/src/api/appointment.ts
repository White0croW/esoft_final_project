import api from "./base";
import { Appointment } from "../types";

export const getAppointments = () =>
    api.get<Appointment[]>("/appointments").then((res) => res.data);

export const getAppointment = (id: number) =>
    api.get<Appointment>(`/appointments/${id}`).then((res) => res.data);

export const createAppointment = (data: {
    serviceId: number;
    barberId: number;
    date: string;
    time: string;
}) => api.post<Appointment>("/appointments", data).then((res) => res.data);

export const updateAppointment = (
    id: number,
    data: Partial<{
        serviceId: number;
        barberId: number;
        date: string;
        time: string;
        status: string;
    }>
) => api.put<Appointment>(`/appointments/${id}`, data).then((res) => res.data);

export const deleteAppointment = (id: number) =>
    api.delete<void>(`/appointments/${id}`).then((res) => res.data);
