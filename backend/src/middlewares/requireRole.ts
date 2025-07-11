// src/middleware/requireRole.ts
import { Request, Response, NextFunction } from "express";

export function requireRole(role: string) {
    return (req: Request & { user?: { userId: number; role: string } }, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (req.user.role !== role) {
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
    };
}
