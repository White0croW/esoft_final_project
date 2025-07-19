import api from '../base';
import { Appointment } from '../../types';

interface FetchAppointmentsParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: string;
}
interface PaginatedResponse {
    data: Appointment[];
    total: number;
    totalPages: number;
    currentPage: number;
}

export const adminAppointmentApi = {
    getAll: async (params?: FetchAppointmentsParams): Promise<PaginatedResponse> => {
        const response = await api.get('/admin/appointments', { params });
        return response.data;
    },

    getById: async (id: number): Promise<Appointment> => {
        const response = await api.get(`/admin/appointments/${id}`);
        return response.data;
    },

    create: async (data: Partial<Appointment>): Promise<Appointment> => {
        const response = await api.post('/admin/appointments', data);
        return response.data;
    },

    update: async (id: number, data: Partial<Appointment>): Promise<Appointment> => {
        const response = await api.put(`/admin/appointments/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/appointments/${id}`);
    }
};