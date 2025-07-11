import api from "./base";
import { Appointment } from "../types";

export const getAppointments = (): Promise<Appointment[]> =>
    api.get<Appointment[]>("/appointments").then((res) => res.data);

export const getAppointment = (id: number): Promise<Appointment> =>
    api.get<Appointment>(`/appointments/${id}`).then((res) => res.data);

export const createAppointment = (
    data: Omit<Appointment, "id" | "userId">
): Promise<Appointment> =>
    api.post<Appointment>("/appointments", data).then((res) => res.data);

export const updateAppointment = (
    id: number,
    data: Partial<Omit<Appointment, "id" | "userId">>
): Promise<Appointment> =>
    api.put<Appointment>(`/appointments/${id}`, data).then((res) => res.data);

export const deleteAppointment = (id: number): Promise<void> =>
    api.delete<void>(`/appointments/${id}`).then((res) => res.data);
