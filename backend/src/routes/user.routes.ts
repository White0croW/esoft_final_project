import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
router.use(authMiddleware);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);

export default router;
