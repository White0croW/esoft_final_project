import { Router } from "express";
import { z } from "zod";
import { validate } from "../utils/validation";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
    listAppointments,
    getAppointment,
    createAppointment,
    updateAppointment,
    deleteAppointment,
} from "../controllers/appointment.controller";

const router = Router();
router.use(authMiddleware);

// Схема для create
const createSchema = z.object({
    body: z.object({
        serviceId: z.number().int().positive(),
        barberId: z.number().int().positive(),
        date: z.string().refine(d => !isNaN(Date.parse(d)), { message: "Invalid date" }),
        time: z.string().regex(/^\d\d:\d\d$/, { message: "HH:MM format" }),
    }),
});

// Схема для update
const updateSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, { message: "Invalid id" }).transform(Number),
    }),
    body: z.object({
        serviceId: z.number().int().positive().optional(),
        barberId: z.number().int().positive().optional(),

        // сначала .regex, потом .optional()
        time: z
            .string()
            .regex(/^\d\d:\d\d$/, { message: "HH:MM format" })
            .optional(),

        // для даты тоже: сначала проверяем, потом optional
        date: z
            .string()
            .refine(d => !d || !isNaN(Date.parse(d)), { message: "Invalid date" })
            .optional(),

        status: z.string().optional(),
    }),
});

router.get("/", listAppointments);
router.post("/", validate(createSchema), createAppointment);
router.get("/:id", validate(updateSchema.pick({ params: true })), getAppointment);
router.put("/:id", validate(updateSchema), updateAppointment);
router.delete("/:id", validate(updateSchema.pick({ params: true })), deleteAppointment);

export default router;
