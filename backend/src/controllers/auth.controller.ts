import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { signJwt } from "../utils/jwt";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

/**
 * POST /auth/signup
 * body: { name, email, password, phone? }
 */
export async function signup(req: Request, res: Response) {
    try {
        const { name, email, password, phone } = req.body;

        // 1) Проверяем, что email ещё не зарегистрирован
        const exists = await db.user.findUnique({ where: { email } });
        if (exists) {
            return res.status(409).json({ message: "Email уже используется" });
        }

        // 2) Хэшируем пароль
        const hash = await bcrypt.hash(password, 10);

        // 3) Создаём пользователя с ролью "user" по умолчанию
        const user = await db.user.create({
            data: { name, email, password: hash, phone },
        });

        // 4) Генерируем JWT
        const token = signJwt({ userId: user.id, role: user.role });

        // 5) Возвращаем токен и основные данные профиля
        return res.status(201).json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}

/**
 * POST /auth/signin
 * body: { email, password }
 */
export async function signin(req: Request, res: Response) {
    try {
        const { email, password } = req.body;

        // 1) Ищем пользователя по email
        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Неверный логин или пароль" });
        }

        // 2) Сравниваем хэш
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ message: "Неверный логин или пароль" });
        }

        // 3) Генерируем JWT
        const token = signJwt({ userId: user.id, role: user.role });

        // 4) Отдаём токен и профиль
        return res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}

/**
 * GET /auth/me
 * Возвращает профиль текущего пользователя и историю записей
 */
export async function me(req: Request, res: Response) {
    try {
        const { userId } = (req as any).user;

        // 1) Получаем профиль вместе с appointments
        const user = await db.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                createdAt: true,
                appointments: {
                    include: { barber: true, service: true },
                    // Исправленная сортировка
                    orderBy: [{ date: "desc" }, { startTime: "desc" }],
                },
            },
        });

        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        // 2) Возвращаем профиль и историю
        return res.json(user);
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}
