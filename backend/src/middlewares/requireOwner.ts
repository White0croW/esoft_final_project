// src/middleware/requireOwner.ts
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

export function requireOwner(model: "appointment") {
    return async (req: Request & { user?: { userId: number } }, res: Response, next: NextFunction) => {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ message: "Invalid id" });
        }
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const record = await db[model].findUnique({ where: { id } });
        if (!record) {
            return res.status(404).json({ message: "Not found" });
        }
        if ((record as any).userId !== req.user.userId) {
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
    };
}
