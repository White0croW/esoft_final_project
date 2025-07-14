import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getBarbershops = async (req: Request, res: Response) => {
    const {
        page = 1,
        limit = 6,
        lat,
        lon,
        popular,
        city,
        search
    } = req.query;

    try {
        let where: any = {};
        let orderBy: any = {};

        // Фильтрация по городу (ищем в адресе)
        if (city) {
            where.address = {
                contains: city as string,
                mode: 'insensitive'
            };
        }

        // Поиск по названию
        if (search) {
            where.name = {
                contains: search as string,
                mode: 'insensitive'
            };
        }

        // Фильтрация по местоположению
        if (lat && lon) {
            const userLat = parseFloat(lat as string);
            const userLon = parseFloat(lon as string);

            where.AND = [
                { lat: { gte: userLat - 0.5 } },
                { lat: { lte: userLat + 0.5 } },
                { lon: { gte: userLon - 0.5 } },
                { lon: { lte: userLon + 0.5 } },
            ];
        }

        // Популярные барбершопы (если не указана геолокация и город)
        if (popular && !lat && !lon && !city) {
            orderBy = { name: "asc" };
        }

        // Запрос с фильтрами
        const barbershops = await prisma.barbershop.findMany({
            where,
            include: { barbers: true },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            orderBy,
        });

        res.json(barbershops);
    } catch (error) {
        console.error(error);
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
        console.error(error);
        res.status(500).json({ error: "Ошибка загрузки барбершопа" });
    }
};

// Новый метод для получения списка городов (из адресов)
export const getCities = async (req: Request, res: Response) => {
    try {
        const barbershops = await prisma.barbershop.findMany({
            select: { address: true },
        });

        // Извлекаем города из адресов
        const cities = barbershops
            .map(shop => {
                // Пытаемся извлечь город из адреса (первая часть до запятой)
                const match = shop.address.match(/^([^,]+)/);
                return match ? match[1].trim() : null;
            })
            .filter((city): city is string => !!city && city.length > 0)
            .filter((city, index, self) => self.indexOf(city) === index) // Уникальные
            .sort();

        res.json(cities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка загрузки городов" });
    }
};