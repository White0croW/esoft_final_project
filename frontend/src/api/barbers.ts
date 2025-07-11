import api from "./base";
import { Barber } from "../types";

export const getBarbers = (): Promise<Barber[]> =>
    api.get<Barber[]>("/barbers").then(res => res.data);

export const createBarber = (data: Omit<Barber, "id">): Promise<Barber> =>
    api.post<Barber>("/barbers", data).then(res => res.data);

export const updateBarber = (
    id: number,
    data: Partial<Omit<Barber, "id">>
): Promise<Barber> =>
    api.put<Barber>(`/barbers/${id}`, data).then(res => res.data);

export const deleteBarber = (id: number): Promise<void> =>
    api.delete<void>(`/barbers/${id}`).then(res => res.data);
