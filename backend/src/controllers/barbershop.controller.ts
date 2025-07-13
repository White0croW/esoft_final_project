// src/controllers/barbershop.controller.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getBarbershops = async (req: Request, res: Response) => {
    const { lat, lon, popular, page = 1, limit = 6 } = req.query;

    try {
        let barbershops;

        if (popular === "true") {
            // Популярные барбершопы 
            barbershops = await prisma.barbershop.findMany({
                orderBy: { name: "asc" },
                include: { barbers: true },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
            });
        } else if (lat && lon) {
            // Фильтрация по радиусу
            const userLat = parseFloat(lat as string);
            const userLon = parseFloat(lon as string);

            barbershops = await prisma.barbershop.findMany({
                include: { barbers: true },
                where: {
                    lat: { gte: userLat - 0.5, lte: userLat + 0.5 },
                    lon: { gte: userLon - 0.5, lte: userLon + 0.5 },
                },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
            });
        } else {
            // Все барбершопы без фильтра
            barbershops = await prisma.barbershop.findMany({
                include: { barbers: true },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
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