import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getBarberById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    try {
        const barber = await prisma.barber.findUnique({
            where: { id },
            include: {
                services: true,
                barbershop: true
            },
        });

        if (!barber) {
            return res.status(404).json({ error: "Мастер не найден" });
        }

        res.json(barber);
    } catch (error) {
        console.error("Barber fetch error:", error);
        res.status(500).json({
            error: "Ошибка сервера",
            details: error instanceof Error ? error.message : "Unknown error"
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
            const searchStr = search as string;
            const isInteger = /^-?\d+$/.test(searchStr);
            const searchNum = isInteger ? parseInt(searchStr) : NaN;

            where = {
                OR: [
                    ...(isInteger ? [{ id: searchNum }] : []),
                    { name: { contains: searchStr, mode: 'insensitive' } },
                    { specialization: { contains: searchStr, mode: 'insensitive' } },
                    { barbershop: { name: { contains: searchStr, mode: 'insensitive' } } },
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
                        select: {
                            id: true,
                            name: true,
                            address: true
                        }
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
        console.error("Barbers fetch error:", error);
        res.status(500).json({
            error: "Ошибка при получении мастеров",
            details: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

export const createBarber = async (req: Request, res: Response) => {
    const { name, specialization, barbershopId, rating } = req.body;
    const userId = (req as any).user?.userId;

    try {
        // Валидация данных
        if (!name) {
            return res.status(400).json({ error: "Имя мастера обязательно" });
        }

        const newBarber = await prisma.barber.create({
            data: {
                name,
                specialization,
                rating: rating ? parseFloat(rating) : 0,
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
        console.error("Barber create error:", error);
        res.status(500).json({
            error: "Ошибка при создании мастера",
            details: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

export const updateBarber = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { name, specialization, barbershopId, rating } = req.body;
    const userId = (req as any).user?.userId;

    try {
        // Проверка существования барбера
        const existingBarber = await prisma.barber.findUnique({ where: { id } });
        if (!existingBarber) {
            return res.status(404).json({ error: "Мастер не найден" });
        }

        const updatedBarber = await prisma.barber.update({
            where: { id },
            data: {
                name,
                specialization,
                rating: rating ? parseFloat(rating) : existingBarber.rating,
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
                        name: updatedBarber.name,
                        changes: {
                            name: existingBarber.name !== name,
                            specialization: existingBarber.specialization !== specialization,
                            barbershopId: existingBarber.barbershopId !== barbershopId,
                            rating: existingBarber.rating !== rating
                        }
                    }
                }
            });
        }

        res.json(updatedBarber);
    } catch (error) {
        console.error("Barber update error:", error);
        res.status(500).json({
            error: "Ошибка при обновлении мастера",
            details: error instanceof Error ? error.message : "Unknown error"
        });
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

        // Проверка связанных записей
        const appointments = await prisma.appointment.count({
            where: { barberId: id }
        });

        if (appointments > 0) {
            return res.status(400).json({
                error: "Нельзя удалить мастера с активными записями",
                appointmentsCount: appointments
            });
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
        console.error("Barber delete error:", error);
        res.status(500).json({
            error: "Ошибка при удалении мастера",
            details: error instanceof Error ? error.message : "Unknown error"
        });
    }
};