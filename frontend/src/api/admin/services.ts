import api from '../base';
import { Service } from '../../types';

export const adminServiceApi = {
    getAll: async (params?: any): Promise<{
        data: Service[];
        total: number;
        totalPages: number;
        currentPage: number
    }> => {
        const response = await api.get('/admin/services', { params });
        return response.data;
    },

    getById: async (id: number): Promise<Service> => {
        const response = await api.get(`/admin/services/${id}`);
        return response.data;
    },

    create: async (data: Omit<Service, 'id' | 'createdAt'>): Promise<Service> => {
        const response = await api.post('/admin/services', data);
        return response.data;
    },

    update: async (id: number, data: Partial<Service>): Promise<Service> => {
        const response = await api.put(`/admin/services/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/services/${id}`);
    },
};