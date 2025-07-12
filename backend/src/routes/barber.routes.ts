// src/routes/barber.routes.ts
import { Router } from "express";
import { getBarberById } from "../controllers/barber.controller";

const router = Router();

router.get("/:id", getBarberById);

export default router;