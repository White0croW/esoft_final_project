import express, { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

let cachedStats: any = null;
let lastFetch = 0;

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        // Возвращаем кэшированные данные если они свежие (< 5 минут)
        if (cachedStats && Date.now() - lastFetch < 300000) {
            return res.json(cachedStats);
        }

        const [usersCount, barbershopsCount, appointmentsCount] = await Promise.all([
            db.user.count(),
            db.barbershop.count(),
            db.appointment.count()
        ]);

        const stats = {
            users: usersCount,
            barbershops: barbershopsCount,
            appointments: appointmentsCount
        };

        // Обновляем кэш
        cachedStats = stats;
        lastFetch = Date.now();

        res.json(stats);
    } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

export const getRecentActions = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            db.auditLog.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { name: true } } }
            }),
            db.auditLog.count()
        ]);

        const formattedActions = logs.map((log: any) => ({
            id: log.id,
            action: log.action,
            timestamp: log.createdAt.toISOString(),
            user: log.user.name,
            details: log.details
        }));

        res.json({
            actions: formattedActions,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error: any) {
        console.error('Error fetching recent actions:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};