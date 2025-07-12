// src/controllers/barber.controller.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getBarberById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    try {
        const barber = await prisma.barber.findUnique({
            where: { id },
            include: {
                appointments: {
                    include: {
                        service: true,
                    },
                },
            },
        });
        if (!barber) {
            return res.status(404).json({ error: "Мастер не найден" });
        }
        res.json(barber);
    } catch (error) {
        res.status(500).json({ error: "Ошибка загрузки мастера" });
    }
};