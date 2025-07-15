import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";

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

// ADMIN: Получение всех пользователей
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await db.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true
            }
        });
        res.json(users);
    } catch (err) {
        console.error("getAllUsers error:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

// ADMIN: Получение пользователя по ID
export const getUserById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const user = await db.user.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true
            }
        });
        if (!user) return res.status(404).json({ message: "Пользователь не найден" });
        res.json(user);
    } catch (err) {
        console.error("getUserById error:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

// ADMIN: Создание пользователя
export const createUser = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, phone } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                phone: phone?.trim()
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true
            }
        });
        await db.auditLog.create({
            data: {
                userId: (req as any).user.userId,
                action: "USER_CREATED",
                details: {
                    createdUserId: newUser.id,
                    email: newUser.email
                }
            }
        });
        res.status(201).json(newUser);
    } catch (err) {
        console.error("createUser error:", err);
        res.status(400).json({ message: "Ошибка создания пользователя" });
    }
};

// ADMIN: Обновление пользователя
export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, email, role, phone } = req.body;

    try {
        const updatedUser = await db.user.update({
            where: { id: Number(id) },
            data: { name, email, role, phone },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true
            }
        });
        await db.auditLog.create({
            data: {
                userId: (req as any).user.userId,
                action: "USER_UPDATED",
                details: {
                    updatedUserId: updatedUser.id,
                    email: updatedUser.email
                }
            }
        });
        res.json(updatedUser);
    } catch (err) {
        console.error("updateUser error:", err);
        res.status(400).json({ message: "Ошибка обновления пользователя" });
    }
};

// ADMIN: Удаление пользователя
export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const deletedUser = await db.user.delete({ where: { id: Number(id) } });
        await db.auditLog.create({
            data: {
                userId: (req as any).user.userId,
                action: "USER_DELETED",
                details: {
                    deletedUserId: deletedUser.id,
                    email: deletedUser.email
                }
            }
        });
        res.status(204).send();
    } catch (err) {
        console.error("deleteUser error:", err);
        res.status(400).json({ message: "Ошибка удаления пользователя" });
    }
};