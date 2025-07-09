import { Router } from "express";
import {
    listServices,
    getService,
    createService,
    updateService,
    deleteService,
} from "../controllers/service.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { z } from "zod";
import { validate } from "../utils/validation";

const router = Router();

// 1) Схема для создания услуги
const createSchema = z.object({
    body: z.object({
        name: z.string(),
        description: z.string().optional(),
        duration: z.number().int().positive(),
        price: z.number().positive(),
    }),
});

// 2) Схема для :id в params
const idSchema = z.object({
    params: z.object({
        id: z
            .string()
            .regex(/^\d+$/, { message: "Invalid id" })
            .transform(val => Number(val)),
    }),
});

// 3) Схема для обновления услуги
const updateSchema = z.object({
    params: idSchema.shape.params,
    body: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        duration: z.number().int().positive().optional(),
        price: z.number().positive().optional(),
    }),
});

// CRUD-маршруты

// публичный список и получение по ID
router.get("/", listServices);
router.get("/:id", validate(idSchema), getService);

// создание (admin)
router.post("/", authMiddleware, validate(createSchema), createService);

// обновление (admin)
router.put(
    "/:id",
    authMiddleware,
    validate(updateSchema),
    updateService
);

// удаление (admin)
router.delete(
    "/:id",
    authMiddleware,
    validate(idSchema),
    deleteService
);

export default router;
