// src/services/api/admin/barbershops.ts
import api from '../base';
import { BarberShop } from '../../types';

export const adminBarbershopApi = {
    getAll: async (): Promise<BarberShop[]> => {
        const response = await api.get('/admin/barbershops');
        return response.data;
    },

    getById: async (id: number): Promise<BarberShop> => {
        const response = await api.get(`/admin/barbershops/${id}`);
        return response.data;
    },

    create: async (data: Omit<BarberShop, 'id'>): Promise<BarberShop> => {
        const response = await api.post('/admin/barbershops', data);
        return response.data;
    },

    update: async (id: number, data: Partial<BarberShop>): Promise<BarberShop> => {
        const response = await api.put(`/admin/barbershops/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/barbershops/${id}`);
    }
};