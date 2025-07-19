// src/controllers/appointment.controller.ts
import { Request, Response } from "express";
import { AppointmentStatus, DayOfWeek, PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

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

        // 2. Получить график работы барбера
        const today = new Date(date);
        const dayOfWeek = today.getDay();
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
            service.duration
        );

        // 5. Фильтрация занятых слотов
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
        res.status(500).json({ error: "Ошибка сервера" });
    }
};

async function hasUserAppointmentConflict(
    userId: number,
    date: Date,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: number // Добавляем параметр для исключения текущей записи
): Promise<boolean> {
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const where: any = {
        userId,
        date: {
            gte: startOfDay,
            lt: endOfDay
        },
        status: { in: ["NEW", "CONFIRMED"] },
        NOT: excludeAppointmentId ? { id: excludeAppointmentId } : undefined,
        OR: [
            {
                AND: [
                    { startTime: { lt: endTime } },
                    { endTime: { gt: startTime } }
                ]
            }
        ]
    };

    const existingAppointments = await prisma.appointment.findMany({
        where
    });

    return existingAppointments.length > 0;
}

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

            // 3. Проверить, нет ли у пользователя другой записи на это время
            const userConflict = await hasUserAppointmentConflict(
                userId,
                new Date(date),
                startTime,
                endTime
            );

            if (userConflict) {
                return res.status(409).json({
                    error: "У вас уже есть запись на это время к другому барберу"
                });
            }

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
            res.status(400).json({ error: "Ошибка создания записи" });
        }
    }
];

export const getMyAppointments = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;

    try {
        const appointments = await prisma.appointment.findMany({
            where: { userId },
            include: {
                service: true,
                barber: {
                    include: {
                        barbershop: true  // Правильное отношение через барбера
                    }
                }
            }
        });

        const result = appointments.map(app => ({
            id: app.id,
            date: app.date.toISOString(),
            startTime: app.startTime,
            endTime: app.endTime,
            status: app.status,
            service: {
                id: app.service.id,
                name: app.service.name
            },
            barber: {
                id: app.barber.id,
                name: app.barber.name
            },
            // Получаем барбершоп через барбера
            barbershop: {
                id: app.barber.barbershop?.id,
                name: app.barber.barbershop?.name,
                address: app.barber.barbershop?.address
            }
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Ошибка сервера" });
    }
};

export const cancelAppointment = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    try {
        // Проверка принадлежности записи пользователю
        const appointment = await prisma.appointment.findFirst({
            where: {
                id: parseInt(id),
                userId,
                status: { in: ["NEW", "CONFIRMED"] } // Можно отменять только новые или подтвержденные
            }
        });

        if (!appointment) {
            return res.status(404).json({ message: "Запись не найдена или недоступна для отмены" });
        }

        // Обновляем статус записи
        await prisma.appointment.update({
            where: { id: parseInt(id) },
            data: { status: "CANCELED" }
        });

        res.json({ message: "Запись успешно отменена" });
    } catch (error) {
        res.status(500).json({ message: "Ошибка при отмене записи" });
    }
};

export const getAllAppointments = async (req: Request, res: Response) => {
    const {
        page = 1,
        limit = 10,
        search,
        status,
        sortBy = 'id',
        sortOrder = 'asc'
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    try {
        // Формирование условий фильтрации
        let where: any = {};

        // Фильтр по статусу
        if (status && Object.values(AppointmentStatus).includes(status as AppointmentStatus)) {
            where.status = status;
        }

        // Поиск по связанным данным
        if (search) {
            const searchStr = search as string;
            const isInteger = /^-?\d+$/.test(searchStr);
            const searchNum = isInteger ? parseInt(searchStr) : NaN;
            where.OR = [
                ...(isInteger ? [{ id: searchNum }] : []),
                { user: { name: { contains: search as string, mode: 'insensitive' } } },
                { service: { name: { contains: search as string, mode: 'insensitive' } } },
                { barber: { name: { contains: search as string, mode: 'insensitive' } } },
                { barber: { barbershop: { name: { contains: search as string, mode: 'insensitive' } } } }
            ];
        }

        // Сортировка
        let orderBy: any = {};
        const validSortFields = ['id', 'date', 'createdAt', 'status'];

        if (validSortFields.includes(sortBy as string)) {
            orderBy[sortBy as string] = sortOrder === 'desc' ? 'desc' : 'asc';
        } else {
            orderBy = { id: 'asc' };
        }

        // Запрос к БД
        const [appointments, total] = await prisma.$transaction([
            prisma.appointment.findMany({
                where,
                skip,
                take: limitNum,
                orderBy,
                include: {
                    user: { select: { id: true, name: true } },
                    service: { select: { id: true, name: true } },
                    barber: {
                        select: {
                            id: true,
                            name: true,
                            barbershop: { select: { id: true, name: true } }
                        }
                    }
                }
            }),
            prisma.appointment.count({ where })
        ]);

        res.json({
            data: appointments,
            total,
            totalPages: Math.ceil(total / limitNum),
            currentPage: pageNum,
        });
    } catch (error) {
        res.status(500).json({ error: "Ошибка при получении записей" });
    }
};

// Получение записи по ID
export const getAppointmentById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true } },
                service: { select: { id: true, name: true, price: true } },
                barber: {
                    select: {
                        id: true,
                        name: true,
                        barbershop: { select: { id: true, name: true, address: true } }
                    }
                }
            }
        });

        if (!appointment) {
            return res.status(404).json({ error: "Запись не найдена" });
        }

        res.json(appointment);
    } catch (error) {
        res.status(500).json({ error: "Ошибка сервера" });
    }
};

// Создание новой записи администратором
export const createAdminAppointment = async (req: Request, res: Response) => {
    const { userId, serviceId, barberId, date, startTime, status } = req.body;
    const adminId = (req as any).user.userId;

    try {
        // Проверка существования связанных сущностей
        const [user, service, barber] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId } }),
            prisma.service.findUnique({ where: { id: serviceId } }),
            prisma.barber.findUnique({
                where: { id: barberId },
                include: { barbershop: true }
            })
        ]);

        if (!user) return res.status(400).json({ error: "Пользователь не найден" });
        if (!service) return res.status(400).json({ error: "Услуга не найдена" });
        if (!barber) return res.status(400).json({ error: "Барбер не найден" });

        // Рассчет времени окончания
        const [hours, minutes] = startTime.split(':').map(Number);
        const startDate = new Date(date);
        startDate.setHours(hours, minutes, 0, 0);

        const endDate = new Date(startDate.getTime() + service.duration * 60000);
        const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

        // Проверить, нет ли у пользователя другой записи на это время
        const userConflict = await hasUserAppointmentConflict(
            userId,
            startDate,
            startTime,
            endTime
        );

        if (userConflict) {
            return res.status(409).json({
                error: "У пользователя уже есть запись на это время к другому барберу"
            });
        }

        // Создание записи
        const newAppointment = await prisma.appointment.create({
            data: {
                userId,
                serviceId,
                barberId,
                date: startDate,
                startTime,
                endTime,
                status: status || AppointmentStatus.NEW
            }
        });

        // Аудит-лог
        await prisma.auditLog.create({
            data: {
                userId: adminId,
                action: "APPOINTMENT_CREATED",
                details: {
                    appointmentId: newAppointment.id,
                    userId: user.id,
                    barberId: barber.id,
                    date: newAppointment.date.toISOString()
                }
            }
        });

        res.status(201).json(newAppointment);
    } catch (error) {
        res.status(500).json({ error: "Ошибка при создании записи" });
    }
};

// Обновление записи
export const updateAppointment = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { status, date, startTime, serviceId, barberId } = req.body;
    const adminId = (req as any).user.userId;

    try {
        // Получение текущей записи
        const currentAppointment = await prisma.appointment.findUnique({
            where: { id },
            include: { service: true }
        });

        if (!currentAppointment) {
            return res.status(404).json({ error: "Запись не найдена" });
        }

        // Рассчет нового времени окончания если изменилось время начала или услуга
        let endTime = currentAppointment.endTime;
        let finalDate = currentAppointment.date;

        if (startTime || serviceId) {
            const service = serviceId
                ? await prisma.service.findUnique({ where: { id: serviceId } })
                : currentAppointment.service;

            if (!service) return res.status(400).json({ error: "Услуга не найдена" });

            const time = startTime || currentAppointment.startTime;
            const [hours, minutes] = time.split(':').map(Number);

            const newDate = date
                ? new Date(date)
                : new Date(currentAppointment.date);

            newDate.setHours(hours, minutes, 0, 0);
            finalDate = newDate;

            const endDate = new Date(newDate.getTime() + service.duration * 60000);
            endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
        }

        // Только если изменяется дата/время/услуга
        if (startTime || serviceId || date) {
            // 3. Проверить, нет ли у пользователя другой записи на это время
            const userConflict = await hasUserAppointmentConflict(
                currentAppointment.userId, // Исправлено: передаем ID пользователя
                finalDate,
                startTime || currentAppointment.startTime,
                endTime,
                id // Исключаем текущую запись из проверки
            );

            if (userConflict) {
                return res.status(409).json({
                    error: "У пользователя уже есть другая запись на это время"
                });
            }
        }

        // Обновление записи
        const updatedAppointment = await prisma.appointment.update({
            where: { id },
            data: {
                status: status || currentAppointment.status,
                date: finalDate,
                startTime: startTime || currentAppointment.startTime,
                endTime,
                serviceId: serviceId || currentAppointment.serviceId,
                barberId: barberId || currentAppointment.barberId
            }
        });

        // Аудит-лог
        await prisma.auditLog.create({
            data: {
                userId: adminId,
                action: "APPOINTMENT_UPDATED",
                details: {
                    appointmentId: id,
                    changes: {
                        status: status,
                        date: date,
                        serviceId: serviceId,
                        barberId: barberId
                    }
                }
            }
        });

        res.json(updatedAppointment);
    } catch (error) {
        res.status(500).json({ error: "Ошибка при обновлении записи" });
    }
};

// Удаление записи
export const deleteAppointment = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const adminId = (req as any).user.userId;

    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                user: { select: { name: true } },
                barber: { select: { name: true } }
            }
        });

        if (!appointment) {
            return res.status(404).json({ error: "Запись не найдена" });
        }

        await prisma.appointment.delete({
            where: { id }
        });

        // Аудит-лог
        await prisma.auditLog.create({
            data: {
                userId: adminId,
                action: "APPOINTMENT_DELETED",
                details: {
                    appointmentId: id,
                    userName: appointment.user.name,
                    barberName: appointment.barber.name,
                    date: appointment.date.toISOString()
                }
            }
        });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Ошибка при удалении записи" });
    }
};

function validationResult(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>) {
    throw new Error("Function not implemented.");
}
