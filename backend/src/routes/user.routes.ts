import {
    getProfile,
    updateProfile,
    changePassword,
} from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

import express from "express";
const router = express.Router();

// Все маршруты требуют авторизации
router.use(authMiddleware);

// Получить и обновить профиль
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

// Сменить пароль
router.put("/password", changePassword);

export default router;
