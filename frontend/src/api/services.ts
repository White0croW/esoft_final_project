import api from "./base";
import { Service } from "../types";

export const getServices = (): Promise<Service[]> =>
    api.get<Service[]>("/services").then((res) => res.data);

export const createService = (data: Omit<Service, "id">): Promise<Service> =>
    api.post<Service>("/services", data).then((res) => res.data);

export const updateService = (
    id: number,
    data: Partial<Omit<Service, "id">>
): Promise<Service> =>
    api.put<Service>(`/services/${id}`, data).then((res) => res.data);

export const deleteService = (id: number): Promise<void> =>
    api.delete<void>(`/services/${id}`).then((res) => res.data);
