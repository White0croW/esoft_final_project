import express from 'express';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} from '../controllers/user.controller';
import {
    getDashboardStats,
    getRecentActions
} from '../controllers/admin.controller';
import { requireRole } from '../middlewares/requireRole';
import { Role } from '@prisma/client';
import { validateUser } from '../utils/validation';
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

// Защищаем все роуты ролью ADMIN
router.use(authMiddleware);
router.use(requireRole([Role.ADMIN]));

// Управление пользователями
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users', validateUser, createUser);
router.put('/users/:id', validateUser, updateUser);
router.delete('/users/:id', deleteUser);

// Новые эндпоинты для дашборда
router.get('/stats', getDashboardStats); // Статистика
router.get('/recent-actions', getRecentActions); // Последние действия

export default router;