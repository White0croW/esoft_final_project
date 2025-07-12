// src/controllers/appointment.controller.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createAppointment = async (req: Request, res: Response) => {
    const { serviceId, barberId, date, time } = req.body;
    const userId = (req as any).user.userId;

    try {
        const appointment = await prisma.appointment.create({
            data: {
                userId,
                serviceId,
                barberId,
                date,
                time,
                status: "NEW",
            },
        });
        res.status(201).json(appointment);
    } catch (error) {
        console.error("Ошибка создания записи:", error);
        res.status(400).json({ error: "Ошибка создания записи" });
    }
};