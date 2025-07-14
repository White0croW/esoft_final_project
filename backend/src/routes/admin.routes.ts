import express from 'express';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} from '../controllers/user.controller';
import { requireRole } from '../middlewares/requireRole';
import { Role } from '@prisma/client';
import { validateUser } from '../utils/validation';

const router = express.Router();

// Защищаем все роуты ролью ADMIN
router.use(requireRole([Role.ADMIN]));

// Управление пользователями
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users', validateUser, createUser);
router.put('/users/:id', validateUser, updateUser);
router.delete('/users/:id', deleteUser);

export default router;