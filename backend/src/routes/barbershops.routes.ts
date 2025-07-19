// src/routes/barbershops.routes.ts
import { Router } from "express";
import { getBarbershops, getBarbershopById, getCities, reverseGeocode } from "../controllers/barbershop.controller";

const router = Router();

router.get("/", getBarbershops);
router.get("/:id", getBarbershopById);
router.get("/barbershops/cities", getCities);
// В barbershops.routes.ts
router.get("/reverse-geocode", reverseGeocode);

export default router;