// src/routes/barbershops.routes.ts
import { Router } from "express";
import { getBarbershops, getBarbershopById, getCities } from "../controllers/barbershop.controller";

const router = Router();

router.get("/", getBarbershops);
router.get("/:id", getBarbershopById);
router.get("/barbershops/cities", getCities);

export default router;