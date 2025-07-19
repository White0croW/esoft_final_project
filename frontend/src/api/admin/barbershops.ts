import api from '../base';
import { BarberShop } from '../../types';

interface GetBarbershopsParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

interface BarbershopsResponse {
    data: BarberShop[];
    total: number;
    totalPages: number;
    currentPage: number;
}

export const adminBarbershopApi = {
    getAll: async (params?: GetBarbershopsParams): Promise<BarbershopsResponse> => {
        const response = await api.get('/admin/barbershops', { params });
        return response.data;
    },
    getById: async (id: number): Promise<BarberShop> => {
        const response = await api.get(`/admin/barbershops/${id}`);
        return response.data;
    },
    create: async (data: { name: string; address: string; lat: number; lon: number }): Promise<BarberShop> => {
        const response = await api.post('/admin/barbershops', data);
        return response.data;
    },
    update: async (id: number, data: { name?: string; address?: string; lat?: number; lon?: number }): Promise<BarberShop> => {
        const response = await api.put(`/admin/barbershops/${id}`, data);
        return response.data;
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/barbershops/${id}`);
    },
    suggestAddress: async (query: string): Promise<{ suggestions: any[] }> => {
        const response = await api.post('/suggest/address', { query });
        return response.data;
    }
};