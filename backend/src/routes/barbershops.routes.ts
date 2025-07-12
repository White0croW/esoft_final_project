// src/routes/barbershops.routes.ts
import { Router } from "express";
import { getBarbershops, getBarbershopById } from "../controllers/barbershop.controller";

const router = Router();

router.get("/", getBarbershops);
router.get("/:id", getBarbershopById);

export default router;