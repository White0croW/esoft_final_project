import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from '../types';

export const requireRole = (allowedRoles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as AuthenticatedRequest).user;

        if (!user) {
            return res.status(401).json({ message: 'Требуется авторизация' });
        }

        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        next();
    };
};