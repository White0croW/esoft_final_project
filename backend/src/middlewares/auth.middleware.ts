import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

interface JwtPayload {
    userId: number;
    role: string;
}

export async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Authorization header missing" });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({ message: "Invalid authorization format" });
    }

    const token = parts[1];

    try {
        // 1) Проверяем и декодируем JWT
        const payload = verifyJwt(token) as JwtPayload;

        // 2) Проверяем, что пользователь ещё существует
        const user = await db.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, role: true },
        });
        if (!user) {
            return res.status(401).json({ message: "User no longer exists" });
        }

        // 3) Присваиваем к req.user актуальные данные
        ; (req as any).user = { userId: user.id, role: user.role };

        return next();
    } catch (err: any) {
        console.error("authMiddleware:", err);
        // различаем ошибки JWT
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        }
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}


