// src/controllers/barbershop.controller.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getBarbershops = async (req: Request, res: Response) => {
    const { lat, lon, popular, page = 1, limit = 6 } = req.query;

    try {
        let barbershops;

        if (popular === "true") {
            barbershops = await prisma.barbershop.findMany({
                orderBy: { name: "desc" },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                include: { barbers: true },
            });
        } else if (lat && lon) {
            const userLat = parseFloat(lat as string);
            const userLon = parseFloat(lon as string);

            // Фильтрация по радиусу (например, 50 км)
            barbershops = await prisma.barbershop.findMany({
                include: { barbers: true },
                where: {
                    lat: {
                        gte: userLat - 0.5,
                        lte: userLat + 0.5,
                    },
                    lon: {
                        gte: userLon - 0.5,
                        lte: userLon + 0.5,
                    },
                },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
            });
        } else {
            barbershops = await prisma.barbershop.findMany({
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                include: { barbers: true },
            });
        }

        res.json(barbershops);
    } catch (error) {
        res.status(500).json({ error: "Ошибка загрузки барбершопов" });
    }
};

export const getBarbershopById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    try {
        const barbershop = await prisma.barbershop.findUnique({
            where: { id },
            include: { barbers: true },
        });
        if (!barbershop) {
            return res.status(404).json({ error: "Барбершоп не найден" });
        }
        res.json(barbershop);
    } catch (error) {
        res.status(500).json({ error: "Ошибка загрузки барбершопа" });
    }
};