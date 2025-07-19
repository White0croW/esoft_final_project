import api from '../base';
import { Barber } from '../../types';

interface GetBarbersParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const adminBarberApi = {
    getAll: async (params?: GetBarbersParams): Promise<{
        data: Barber[];
        total: number;
        totalPages: number;
        currentPage: number
    }> => {
        const response = await api.get('/admin/barbers', { params });
        return response.data;
    },

    getById: async (id: number): Promise<Barber> => {
        const response = await api.get(`/admin/barbers/${id}`);
        return response.data;
    },

    create: async (data: Omit<Barber, 'id' | 'createdAt' | 'services'>): Promise<Barber> => {
        const response = await api.post('/admin/barbers', data);
        return response.data;
    },

    update: async (id: number, data: Partial<Omit<Barber, 'id' | 'createdAt' | 'services'>>): Promise<Barber> => {
        const response = await api.put(`/admin/barbers/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/barbers/${id}`);
    },
};