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

// Новый метод для получения списка городов (из адресов)
export const getCities = async (req: Request, res: Response) => {
    try {
        const barbershops = await prisma.barbershop.findMany({
            select: { address: true },
        });

        // Извлекаем все возможные города из адресов
        const citySet = new Set<string>();

        // Список типичных сокращений для городов
        const cityTypes = ["г", "город", "с", "пос", "дер", "пгт", "ст", "аул"];
        const cityPattern = `(?:${cityTypes.join("|")})?\\.?\\s*`;

        barbershops.forEach(shop => {
            const address = shop.address;

            // Вариант 1: Ищем город по шаблону (тип + название)
            const pattern = new RegExp(`${cityPattern}([\\w\\s-]+)`, "gi");
            let match;

            while ((match = pattern.exec(address)) !== null) {
                const candidate = match[1].trim();
                if (candidate.length > 3) { // Исключаем слишком короткие названия
                    citySet.add(candidate);
                }
            }

            // Вариант 2: Просто берем последнюю часть адреса (часто там город)
            const parts = address.split(',').map(part => part.trim());
            if (parts.length > 1) {
                const lastPart = parts[parts.length - 1];
                if (lastPart.length > 3) {
                    citySet.add(lastPart);
                }
            }
        });

        // Преобразуем в массив и сортируем
        const cities = Array.from(citySet).sort();
        res.json(cities);
    } catch (error) {
        res.status(500).json({ error: "Ошибка загрузки городов" });
    }
};

export const getAllBarbershops = async (req: Request, res: Response) => {
    const {
        page = 1,
        limit = 10,
        search,
        sortBy = 'id', // Добавляем параметры сортировки
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
                    { name: { contains: search as string, mode: 'insensitive' } },
                    { address: { contains: search as string, mode: 'insensitive' } },
                    ...(isNumeric ? [
                        { id: searchNum },
                    ] : []),
                ].filter(Boolean)
            };
        }

        // Определяем порядок сортировки
        let orderBy: any = {};
        const validSortFields = ['id', 'name', 'address', 'lat', 'lon', 'createdAt'];

        if (validSortFields.includes(sortBy as string)) {
            orderBy[sortBy as string] = sortOrder === 'desc' ? 'desc' : 'asc';
        } else {
            // Сортировка по умолчанию
            orderBy = { id: 'asc' };
        }

        const [barbershops, total] = await prisma.$transaction([
            prisma.barbershop.findMany({
                where,
                skip,
                take: limitNum,
                orderBy, // Применяем сортировку
            }),
            prisma.barbershop.count({ where }),
        ]);

        res.json({
            data: barbershops,
            total,
            totalPages: Math.ceil(total / limitNum),
            currentPage: pageNum,
        });
    } catch (error) {
        res.status(500).json({ error: "Ошибка при получении барбершопов" });
    }
};

export const createBarbershop = async (req: Request, res: Response) => {
    const { name, address, lat, lon } = req.body;
    const userId = (req as any).user?.userId; // Предполагаем, что пользователь добавлен в req через middleware

    try {
        const newBarbershop = await prisma.barbershop.create({
            data: {
                name,
                address,
                lat: parseFloat(lat),
                lon: parseFloat(lon),
            },
        });

        // Логирование
        if (userId) {
            try {
                await prisma.auditLog.create({
                    data: {
                        userId,
                        action: "BARBERSHOP_CREATED",
                        details: {
                            barbershopId: newBarbershop.id,
                            name: newBarbershop.name
                        }
                    }
                });
            } catch (logError) {
            }
        }

        res.status(201).json(newBarbershop);
    } catch (error) {
        res.status(500).json({ error: "Ошибка при создании барбершопа" });
    }
};

export const updateBarbershop = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { name, address, lat, lon } = req.body;
    const userId = (req as any).user?.userId;

    try {
        const updatedBarbershop = await prisma.barbershop.update({
            where: { id },
            data: {
                name,
                address,
                lat: parseFloat(lat),
                lon: parseFloat(lon),
            },
        });

        // Логирование
        if (userId) {
            try {
                await prisma.auditLog.create({
                    data: {
                        userId,
                        action: "BARBERSHOP_UPDATED",
                        details: {
                            barbershopId: id,
                            name: updatedBarbershop.name
                        }
                    }
                });
            } catch (logError) {
            }
        }

        res.json(updatedBarbershop);
    } catch (error) {
        res.status(500).json({ error: "Ошибка при обновлении барбершопа" });
    }
};

export const deleteBarbershop = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.userId;

    try {
        // Получаем данные перед удалением для лога
        const barbershop = await prisma.barbershop.findUnique({
            where: { id },
            select: { id: true, name: true }
        });

        if (!barbershop) {
            return res.status(404).json({ error: "Барбершоп не найден" });
        }

        await prisma.barbershop.delete({
            where: { id },
        });

        // Логирование
        if (userId) {
            try {
                await prisma.auditLog.create({
                    data: {
                        userId,
                        action: "BARBERSHOP_DELETED",
                        details: {
                            barbershopId: id,
                            name: barbershop.name
                        }
                    }
                });
            } catch (logError) {
            }
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Ошибка при удалении барбершопа" });
    }
};

// Добавьте этот метод в ваш barbershop.controller.ts
export const reverseGeocode = async (req: Request, res: Response) => {
    const { lat, lon } = req.query;

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
            { headers: { 'User-Agent': 'BarbershopApp/1.0' } }
        );
        const data = await response.json();

        // Извлекаем город из ответа
        const city = data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            data.address?.state;

        if (city) {
            return res.json({ city });
        }

        res.status(404).json({ error: "Город не найден" });
    } catch (error) {
        res.status(500).json({ error: "Ошибка геокодирования" });
    }
};