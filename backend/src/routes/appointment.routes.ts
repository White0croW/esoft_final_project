// src/routes/appointment.routes.ts
import { Router } from "express";
import { createAppointment } from "../controllers/appointment.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, createAppointment);

export default router;