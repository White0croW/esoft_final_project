import api from "./base";
import { Appointment, Service } from "../types";

// Получить все записи
export const getAppointments = (token: string) =>
    api.get<Appointment[]>("/appointments", {
        headers: { Authorization: `Bearer ${token}` },
    });

// Получить одну запись
export const getAppointment = (id: number, token: string) =>
    api.get<Appointment>(`/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

// Создать запись
export const createAppointment = (
    data: { serviceId: number; barberId: number; date: string; time: string },
    token: string
) =>
    api.post<Appointment>("/appointments", data, {
        headers: { Authorization: `Bearer ${token}` },
    });

// Обновить запись
export const updateAppointment = (
    id: number,
    data: Partial<{
        serviceId: number;
        barberId: number;
        date: string;
        time: string;
        status: string;
    }>,
    token: string
) =>
    api.put<Appointment>(`/appointments/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });

// Удалить запись
export const deleteAppointment = (id: number, token: string) =>
    api.delete<void>(`/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

// Получить все услуги
export const getServices = (token: string) =>
    api.get<Service[]>("/services", {
        headers: { Authorization: `Bearer ${token}` },
    });
