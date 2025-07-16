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
import { createService, deleteService, getAllServices, getServiceById, updateService } from '../controllers/service.controller';
import { createAdminAppointment, deleteAppointment, getAllAppointments, getAppointmentById, updateAppointment } from '../controllers/appointment.controller';

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

// Управление услугами
router.get('/services', getAllServices);
router.get('/services/:id', getServiceById);
router.post('/services', createService);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);

// Управление записями
router.get('/appointments', getAllAppointments);
router.get('/appointments/:id', getAppointmentById);
router.post('/appointments', createAdminAppointment);
router.put('/appointments/:id', updateAppointment);
router.delete('/appointments/:id', deleteAppointment);

// Новые эндпоинты для дашборда
router.get('/stats', getDashboardStats); // Статистика
router.get('/recent-actions', getRecentActions); // Последние действия

export default router;