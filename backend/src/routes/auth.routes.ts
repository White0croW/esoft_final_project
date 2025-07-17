import express from "express";
import { signup, signin, me } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { z } from "zod";
import { validate } from "../utils/validation";

const router = express.Router();

// 1) Расширили signupSchema: добавили опциональное поле phone
const signupSchema = z.object({
    body: z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(6),
        phone: z.string().optional(),           // добавлено
    }),
});

// signinSchema без изменений
const signinSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(6),
    }),
});

router.post("/signup", validate(signupSchema), signup);
router.post("/signin", validate(signinSchema), signin);

// 2) /me остаётся под защитой authMiddleware
router.get("/me", authMiddleware, me);

export default router;
