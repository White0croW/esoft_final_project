import express from 'express';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} from '../controllers/user.controller';
import {
    getAllBarbershops,
    getBarbershopById,
    createBarbershop,
    updateBarbershop,
    deleteBarbershop
} from '../controllers/barbershop.controller';
import {
    getAllBarbers,
    getBarberById,
    createBarber,
    updateBarber,
    deleteBarber
} from '../controllers/barber.controller';
import {
    getDashboardStats,
    getRecentActions
} from '../controllers/admin.controller';
import { requireRole } from '../middlewares/requireRole';
import { Role } from '@prisma/client';
import { validateUser, validateBarbershop } from '../utils/validation';
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

// Управление барбершопами
router.get('/barbershops', getAllBarbershops);
router.get('/barbershops/:id', getBarbershopById);
router.post('/barbershops', validateBarbershop, createBarbershop);
router.put('/barbershops/:id', validateBarbershop, updateBarbershop);
router.delete('/barbershops/:id', deleteBarbershop);

// Управление барберами
router.get('/barbers', getAllBarbers);
router.get('/barbers/:id', getBarberById);
router.post('/barbers', createBarber);
router.put('/barbers/:id', updateBarber);
router.delete('/barbers/:id', deleteBarber);

// Новые эндпоинты для дашборда
router.get('/stats', getDashboardStats); // Статистика
router.get('/recent-actions', getRecentActions); // Последние действия

export default router;