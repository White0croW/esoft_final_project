// src/controllers/appointment.controller.ts
import { Request, Response } from "express";
import { DayOfWeek, PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

interface TimeSlot {
    start: string;
    end: string;
}

// Middleware для проверки аутентификации
const authenticate = (req: Request, res: Response, next: Function) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Требуется авторизация" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
        (req as any).user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Неверный токен" });
    }
};

// Функция для генерации слотов времени
const generateTimeSlots = (
    start: string,
    end: string,
    duration: number,
    step: number = 15 // Шаг по умолчанию 15 минут
): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);

    let currentMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    // Генерируем слоты с шагом step (15 минут по умолчанию)
    while (currentMinutes + duration <= endMinutes) {
        const startTime = formatTime(currentMinutes);
        const endTime = formatTime(currentMinutes + duration);

        slots.push({ start: startTime, end: endTime });
        currentMinutes += step;
    }

    return slots;
};

const formatTime = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const getAvailableSlots = async (req: Request, res: Response) => {
    const barberId = parseInt(req.params.barberId);
    const serviceId = parseInt(req.query.serviceId as string);
    const date = req.query.date as string;

    try {
        // 1. Получить услугу для определения длительности
        const service = await prisma.service.findUnique({
            where: { id: serviceId }
        });

        if (!service) {
            return res.status(404).json({ error: "Услуга не найдена" });
        }

        // 2. Получить график работы барбера (упрощённая версия)
        const today = new Date(date);
        const dayOfWeek = today.getDay(); // 0-воскресенье, 1-понедельник и т.д.
        const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
        const todayName = dayNames[dayOfWeek] as keyof typeof DayOfWeek;

        const barberSchedule = await prisma.barberSchedule.findFirst({
            where: {
                barberId,
                dayOfWeek: todayName
            }
        });

        if (!barberSchedule || !barberSchedule.isWorking) {
            return res.json([]);
        }

        // 3. Получить существующие записи
        const startOfDay = new Date(date);
        const endOfDay = new Date(new Date(date).setDate(startOfDay.getDate() + 1));

        const existingAppointments = await prisma.appointment.findMany({
            where: {
                barberId,
                date: {
                    gte: startOfDay,
                    lt: endOfDay
                },
                status: { in: ["NEW", "CONFIRMED"] }
            },
            select: {
                startTime: true,
                endTime: true
            }
        });

        // 4. Сгенерировать слоты с шагом = длительности услуги
        const allSlots = generateTimeSlots(
            barberSchedule.startTime || "09:00",
            barberSchedule.endTime || "21:00",
            service.duration,
            service.duration // Шаг = длительности услуги
        );

        // 5. Улучшенная фильтрация занятых слотов
        const availableSlots = allSlots.filter(slot => {
            return !existingAppointments.some(app => {
                const slotStart = slot.start;
                const slotEnd = slot.end;
                const appStart = app.startTime;
                const appEnd = app.endTime;

                return (
                    (slotStart >= appStart && slotStart < appEnd) ||
                    (slotEnd > appStart && slotEnd <= appEnd) ||
                    (slotStart <= appStart && slotEnd >= appEnd)
                );
            });
        });

        res.json(availableSlots);
    } catch (error) {
        console.error("Ошибка получения слотов:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
};

export const createAppointment = [
    authenticate,
    async (req: Request, res: Response) => {
        const { serviceId, barberId, date, startTime } = req.body;
        const userId = (req as any).user.userId;

        try {
            // 1. Получить услугу для определения длительности
            const service = await prisma.service.findUnique({
                where: { id: serviceId }
            });

            if (!service) {
                return res.status(404).json({ error: "Услуга не найдена" });
            }

            // 2. Рассчитать время окончания
            const [hours, minutes] = startTime.split(":").map(Number);
            const startDate = new Date(date);
            startDate.setHours(hours, minutes);

            const endDate = new Date(startDate);
            endDate.setMinutes(endDate.getMinutes() + service.duration);
            const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

            // 3. Проверить доступность слота
            const existingAppointment = await prisma.appointment.findFirst({
                where: {
                    barberId,
                    date: new Date(date),
                    OR: [
                        { startTime },
                        {
                            AND: [
                                { startTime: { lt: endTime } },
                                { endTime: { gt: startTime } }
                            ]
                        }
                    ],
                    status: { in: ["NEW", "CONFIRMED"] }
                }
            });

            if (existingAppointment) {
                return res.status(409).json({ error: "Время уже занято" });
            }

            // 4. Создать запись
            const appointment = await prisma.appointment.create({
                data: {
                    userId,
                    serviceId,
                    barberId,
                    date: new Date(date),
                    startTime,
                    endTime,
                    status: "NEW",
                },
            });

            res.status(201).json(appointment);
        } catch (error) {
            console.error("Ошибка создания записи:", error);
            res.status(400).json({ error: "Ошибка создания записи" });
        }
    }
];