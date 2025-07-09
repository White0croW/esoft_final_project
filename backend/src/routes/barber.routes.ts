// barber.routes.ts
import { Router } from "express";
import { z } from "zod";
import { validate } from "../utils/validation";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
    listBarbers,
    getBarber,
    createBarber,
    updateBarber,
    deleteBarber,
} from "../controllers/barber.controller";

const router = Router();

// 1) Схема для фильтрации списка
const querySchema = z.object({
    query: z.object({
        name: z.string().optional(),
        specialization: z.string().optional(),
        minRating: z.preprocess(val => (val ? Number(val) : undefined), z.number().optional()),
        maxRating: z.preprocess(val => (val ? Number(val) : undefined), z.number().optional()),
    }),
});

// 2) Схема для :id в params
const idSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, { message: "Invalid id" }).transform(Number),
    }),
});

// 3) Схема для создания
const createSchema = z.object({
    body: z.object({
        name: z.string(),
        specialization: z.string().optional(),
        rating: z.number().min(0).max(5).optional(),
    }),
});

// 4) Схема для обновления
const updateSchema = z.object({
    params: idSchema.shape.params,
    body: z.object({
        name: z.string().optional(),
        specialization: z.string().optional(),
        rating: z.number().min(0).max(5).optional(),
    }),
});

// Маршруты
router.get("/", validate(querySchema), listBarbers);
router.get("/:id", validate(idSchema), getBarber);

router.post("/", authMiddleware, validate(createSchema), createBarber);
router.put("/:id", authMiddleware, validate(updateSchema), updateBarber);
router.delete("/:id", authMiddleware, validate(idSchema), deleteBarber);

export default router;
