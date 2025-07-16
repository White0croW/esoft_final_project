// src/controllers/barber.controller.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getBarberById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    try {
        const barber = await prisma.barber.findUnique({
            where: { id },
            include: { services: true },
        });

        if (!barber) {
            return res.status(404).json({ error: "Мастер не найден" });
        }

        res.json(barber);
    } catch (error) {
        console.error("Ошибка при получении мастера:", error);
        // Всегда возвращаем JSON при ошибках!
        res.status(500).json({
            error: "Ошибка сервера",
            details: error
        });
    }
};

export const getAllBarbers = async (req: Request, res: Response) => {
    const {
        page = 1,
        limit = 10,
        search,
        sortBy = 'id',
        sortOrder = 'asc'
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    try {
        let where: any = {};
        if (search) {
            where = {
                OR: [
                    { name: { contains: search as string, mode: 'insensitive' } },
                    { specialization: { contains: search as string, mode: 'insensitive' } },
                ],
            };
        }

        let orderBy: any = {};
        const validSortFields = ['id', 'name', 'specialization', 'rating', 'createdAt'];

        if (validSortFields.includes(sortBy as string)) {
            orderBy[sortBy as string] = sortOrder === 'desc' ? 'desc' : 'asc';
        } else {
            orderBy = { id: 'asc' };
        }

        const [barbers, total] = await prisma.$transaction([
            prisma.barber.findMany({
                where,
                skip,
                take: limitNum,
                orderBy,
                include: {
                    barbershop: {
                        select: { name: true }
                    }
                }
            }),
            prisma.barber.count({ where }),
        ]);

        res.json({
            data: barbers,
            total,
            totalPages: Math.ceil(total / limitNum),
            currentPage: pageNum,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка при получении мастеров" });
    }
};

export const createBarber = async (req: Request, res: Response) => {
    const { name, specialization, barbershopId } = req.body;
    const userId = (req as any).user?.userId;

    try {
        const newBarber = await prisma.barber.create({
            data: {
                name,
                specialization,
                barbershopId: barbershopId ? parseInt(barbershopId) : null
            }
        });

        // Audit log
        if (userId) {
            await prisma.auditLog.create({
                data: {
                    userId,
                    action: "BARBER_CREATED",
                    details: {
                        barberId: newBarber.id,
                        name: newBarber.name
                    }
                }
            });
        }

        res.status(201).json(newBarber);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка при создании мастера" });
    }
};

export const updateBarber = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { name, specialization, barbershopId } = req.body;
    const userId = (req as any).user?.userId;

    try {
        const updatedBarber = await prisma.barber.update({
            where: { id },
            data: {
                name,
                specialization,
                barbershopId: barbershopId ? parseInt(barbershopId) : null
            }
        });

        // Audit log
        if (userId) {
            await prisma.auditLog.create({
                data: {
                    userId,
                    action: "BARBER_UPDATED",
                    details: {
                        barberId: id,
                        name: updatedBarber.name
                    }
                }
            });
        }

        res.json(updatedBarber);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка при обновлении мастера" });
    }
};

export const deleteBarber = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.userId;

    try {
        const barber = await prisma.barber.findUnique({
            where: { id },
            select: { id: true, name: true }
        });

        if (!barber) {
            return res.status(404).json({ error: "Мастер не найден" });
        }

        await prisma.barber.delete({
            where: { id },
        });

        // Audit log
        if (userId) {
            await prisma.auditLog.create({
                data: {
                    userId,
                    action: "BARBER_DELETED",
                    details: {
                        barberId: id,
                        name: barber.name
                    }
                }
            });
        }

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка при удалении мастера" });
    }
};