import {
    createAppointment,
    getMyAppointments,
    cancelAppointment
} from "../controllers/appointment.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

import express from "express";
const router = express.Router();

router.post("/", authMiddleware, createAppointment);

// Новые маршруты для управления записями
router.get("/me", authMiddleware, getMyAppointments);
router.patch("/:id/cancel", authMiddleware, cancelAppointment);

export default router;