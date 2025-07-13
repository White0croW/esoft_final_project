import api from "./base";

export interface Appointment {
    id: number;
    date: string; // ISO string
    startTime: string;
    endTime: string;
    status: string;
    service: {
        id: number;
        name: string;
    };
    barber: {
        id: number;
        name: string;
    };
    barbershop: {
        id: number;
        name: string;
        address: string;
    };
}

export interface TimeSlot {
    start: string;
    end: string;
}

export const createAppointment = async (data: {
    serviceId: number;
    barberId: number;
    date: string;
    startTime: string;
    userId: number;
}) => {
    const response = await api.post("/appointments", data);
    return response.data;
};

// Новые методы для работы с записями пользователя
export const getMyAppointments = (): Promise<Appointment[]> =>
    api.get("/appointments/me").then(res => res.data);

export const updateAppointment = (id: number, data: {
    date?: string;
    startTime?: string;
    barberId?: number;
    serviceId?: number;
}): Promise<Appointment> =>
    api.patch(`/appointments/${id}`, data).then(res => res.data);

export const cancelAppointment = (id: number): Promise<{ message: string }> =>
    api.patch(`/appointments/${id}/cancel`).then(res => res.data);

// api/appointment.ts
export const getAvailableSlots = (
    barberId: number,
    serviceId: number,
    date: string
): Promise<TimeSlot[]> => {
    return api.get(`/barbers/${barberId}/slots?serviceId=${serviceId}&date=${date}`)
        .then(res => res.data);
};