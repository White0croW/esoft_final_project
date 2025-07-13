// src/routes/barberRoutes.ts
import express from "express";
import {
    getBarberById
} from "../controllers/barber.controller";
import {
    createAppointment, getAvailableSlots
} from "../controllers/appointment.controller";

const router = express.Router();

router.get("/:id", getBarberById);
router.get("/:barberId/available-slots", getAvailableSlots);
router.post("/appointments", ...createAppointment);

export default router;