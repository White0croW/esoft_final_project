import api from '../base';
import { User, UserCreateData, UserUpdateData } from '../../types';

interface GetUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

interface UsersResponse {
    data: User[];
    total: number;
    totalPages: number;
    currentPage: number;
}

export const adminUserApi = {
    getAll: async (params: GetUsersParams): Promise<UsersResponse> => {
        const response = await api.get('/admin/users', { params });
        return response.data;
    },
    getById: async (id: number): Promise<User> => {
        const response = await api.get(`/admin/users/${id}`);
        return response.data;
    },
    create: async (userData: UserCreateData): Promise<User> => {
        const response = await api.post('/admin/users', userData);
        return response.data;
    },
    update: async (id: number, userData: UserUpdateData): Promise<User> => {
        const response = await api.put(`/admin/users/${id}`, userData);
        return response.data;
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/users/${id}`);
    }
};