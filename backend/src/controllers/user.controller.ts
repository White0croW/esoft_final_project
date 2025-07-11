import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const db = new PrismaClient();

// GET /profile
export async function getProfile(req: Request, res: Response) {
    const userId = (req as any).user.userId;

    try {
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, phone: true, role: true },
        });
        if (!user) return res.status(404).json({ message: "Пользователь не найден" });
        res.json(user);
    } catch (err) {
        console.error("getProfile error:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
}

// PUT /profile
export async function updateProfile(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const { name, email, phone } = req.body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({ message: "Введите корректное имя" });
    }
    if (
        !email ||
        typeof email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        return res.status(400).json({ message: "Некорректный email" });
    }
    if (phone && typeof phone !== "string") {
        return res.status(400).json({ message: "Телефон должен быть строкой" });
    }

    try {
        // Проверка, что новый email не занят
        const exists = await db.user.findUnique({ where: { email } });
        if (exists && exists.id !== userId) {
            return res.status(409).json({ message: "Email уже занят" });
        }

        const user = await db.user.update({
            where: { id: userId },
            data: {
                name: name.trim(),
                email: email.trim(),
                phone: phone?.trim(),
            },
            select: { id: true, name: true, email: true, phone: true, role: true },
        });
        res.json({ message: "Профиль обновлён", user });
    } catch (err) {
        console.error("updateProfile error:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
}

// PUT /password
export async function changePassword(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || typeof oldPassword !== "string" || oldPassword.length < 6) {
        return res.status(400).json({ message: "Текущий пароль некорректен" });
    }
    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
        return res.status(400).json({ message: "Новый пароль должен быть минимум 6 символов" });
    }

    try {
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { password: true },
        });
        if (!user) return res.status(404).json({ message: "Пользователь не найден" });

        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) {
            return res.status(400).json({ message: "Текущий пароль неверен" });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await db.user.update({
            where: { id: userId },
            data: { password: hashed },
        });

        res.json({ message: "Пароль обновлён" });
    } catch (err) {
        console.error("changePassword error:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
}
