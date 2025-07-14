// src/services/api/admin/users.ts
import api from '../base';
import { User, UserCreateData, UserUpdateData } from '../../types';

export const adminUserApi = {
    // Получить всех пользователей
    getAll: async (): Promise<User[]> => {
        const response = await api.get('/admin/users');
        return response.data;
    },

    // Получить пользователя по ID
    getById: async (id: number): Promise<User> => {
        const response = await api.get(`/admin/users/${id}`);
        return response.data;
    },

    // Создать пользователя
    create: async (userData: UserCreateData): Promise<User> => {
        const response = await api.post('/admin/users', userData);
        return response.data;
    },

    // Обновить пользователя
    update: async (id: number, userData: UserUpdateData): Promise<User> => {
        const response = await api.put(`/admin/users/${id}`, userData);
        return response.data;
    },

    // Удалить пользователя
    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/users/${id}`);
    }
};