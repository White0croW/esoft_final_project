// src/routes/barbershops.routes.ts
import express from "express";
import { getBarbershops, getBarbershopById, getCities } from "../controllers/barbershop.controller";

const router = express.Router();

router.get("/", getBarbershops);
router.get("/:id", getBarbershopById);
router.get("/barbershops/cities", getCities);

export default router;