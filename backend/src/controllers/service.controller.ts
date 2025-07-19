import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { equal } from "assert";

const prisma = new PrismaClient();

export const getAllServices = async (req: Request, res: Response) => {
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
            const searchNum = Number(searchStr);
            const isNumeric = !isNaN(searchNum);

            where = {
                OR: [
                    { name: { contains: searchStr, mode: 'insensitive' } },
                    { description: { contains: searchStr, mode: 'insensitive' } },
                    ...(isNumeric ? [
                        { id: searchNum },
                        { duration: searchNum },
                        { price: searchNum }
                    ] : []),
                ].filter(Boolean)
            };
        }

        let orderBy: any = {};
        const validSortFields = ['id', 'name', 'price', 'duration', 'createdAt'];

        if (validSortFields.includes(sortBy as string)) {
            orderBy[sortBy as string] = sortOrder === 'desc' ? 'desc' : 'asc';
        } else {
            orderBy = { id: 'asc' };
        }

        const [services, total] = await prisma.$transaction([
            prisma.service.findMany({
                where,
                skip,
                take: limitNum,
                orderBy,
            }),
            prisma.service.count({ where }),
        ]);

        res.json({
            data: services,
            total,
            totalPages: Math.ceil(total / limitNum),
            currentPage: pageNum,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка при получении услуг" });
    }
};

export const getServiceById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    try {
        const service = await prisma.service.findUnique({
            where: { id },
        });

        if (!service) {
            return res.status(404).json({ error: "Услуга не найдена" });
        }

        res.json(service);
    } catch (error) {
        res.status(500).json({
            error: "Ошибка сервера",
            details: error
        });
    }
};

export const createService = async (req: Request, res: Response) => {
    const { name, description, duration, price } = req.body;
    const userId = (req as any).user?.userId;

    try {
        const newService = await prisma.service.create({
            data: {
                name,
                description,
                duration: parseInt(duration),
                price: parseFloat(price),
            }
        });

        if (userId) {
            await prisma.auditLog.create({
                data: {
                    userId,
                    action: "SERVICE_CREATED",
                    details: {
                        serviceId: newService.id,
                        name: newService.name
                    }
                }
            });
        }

        res.status(201).json(newService);
    } catch (error) {
        res.status(500).json({ error: "Ошибка при создании услуги" });
    }
};

export const updateService = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { name, description, duration, price } = req.body;
    const userId = (req as any).user?.userId;

    try {
        const updatedService = await prisma.service.update({
            where: { id },
            data: {
                name,
                description,
                duration: parseInt(duration),
                price: parseFloat(price),
            }
        });

        if (userId) {
            await prisma.auditLog.create({
                data: {
                    userId,
                    action: "SERVICE_UPDATED",
                    details: {
                        serviceId: id,
                        name: updatedService.name
                    }
                }
            });
        }

        res.json(updatedService);
    } catch (error) {
        res.status(500).json({ error: "Ошибка при обновлении услуги" });
    }
};

export const deleteService = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.userId;

    try {
        const service = await prisma.service.findUnique({
            where: { id },
            select: { id: true, name: true }
        });

        if (!service) {
            return res.status(404).json({ error: "Услуга не найдена" });
        }

        await prisma.service.delete({
            where: { id },
        });

        if (userId) {
            await prisma.auditLog.create({
                data: {
                    userId,
                    action: "SERVICE_DELETED",
                    details: {
                        serviceId: id,
                        name: service.name
                    }
                }
            });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Ошибка при удалении услуги" });
    }
};