import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

interface AuthPayload {
    userId: number;
    role: string;
}

/**
 * GET /appointments
 * Опциональные query-параметры:
 *   - barberId
 *   - serviceId
 *   - date (YYYY-MM-DD)
 *   - status
 *
 * Если роль пользователя не admin — возвращаем только свои записи.
 */
export async function listAppointments(req: Request, res: Response) {
    try {
        const auth = (req as any).user as AuthPayload;
        const { barberId, serviceId, date, status } = req.query;
        const where: any = {};

        if (auth.role !== "admin") {
            where.userId = auth.userId;
        }
        if (barberId) where.barberId = Number(barberId);
        if (serviceId) where.serviceId = Number(serviceId);
        if (status) where.status = String(status);
        if (date) {
            const d = new Date(String(date));
            const next = new Date(d);
            next.setDate(d.getDate() + 1);
            where.date = { gte: d, lt: next };
        }

        const appointments = await db.appointment.findMany({
            where,
            include: { user: true, barber: true, service: true },
            orderBy: [{ date: "asc" }, { time: "asc" }],
        });

        return res.json(appointments);
    } catch (error) {
        console.error("listAppointments:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

/**
 * POST /appointments
 * body: { serviceId, barberId, date, time }
 */
export async function createAppointment(req: Request, res: Response) {
    try {
        const auth = (req as any).user as AuthPayload;
        const { serviceId, barberId, date, time } = req.body;

        const appointmentDate = new Date(date);
        if (appointmentDate < new Date()) {
            return res.status(400).json({ message: "Нельзя записаться на прошедшее время" });
        }

        // Проверяем, нет ли коллизии по barber + date + time
        const conflict = await db.appointment.findFirst({
            where: { barberId, date: appointmentDate, time },
        });
        if (conflict) {
            return res
                .status(409)
                .json({ message: "Данный слот уже занят у выбранного барбера" });
        }

        const appt = await db.appointment.create({
            data: {
                userId: auth.userId,
                serviceId,
                barberId,
                date: appointmentDate,
                time,
            },
            include: { user: true, barber: true, service: true },
        });

        return res.status(201).json(appt);
    } catch (error) {
        console.error("createAppointment:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

/**
 * GET /appointments/:id
 * Если не admin — проверяем, что запись принадлежит текущему пользователю.
 */
export async function getAppointment(req: Request, res: Response) {
    try {
        const auth = (req as any).user as AuthPayload;
        const id = Number(req.params.id);

        const appt = await db.appointment.findUnique({
            where: { id },
            include: { user: true, barber: true, service: true },
        });
        if (!appt) {
            return res.status(404).json({ message: "Запись не найдена" });
        }
        if (auth.role !== "admin" && appt.userId !== auth.userId) {
            return res.status(403).json({ message: "Доступ запрещён" });
        }
        return res.json(appt);
    } catch (error) {
        console.error("getAppointment:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

/**
 * PUT /appointments/:id
 * body: { serviceId?, barberId?, date?, time?, status? }
 * Только admin или владелец может обновить.
 */
export async function updateAppointment(req: Request, res: Response) {
    try {
        const auth = (req as any).user as AuthPayload;
        const id = Number(req.params.id);

        // Проверка доступа
        const exist = await db.appointment.findUnique({ where: { id } });
        if (!exist) {
            return res.status(404).json({ message: "Запись не найдена" });
        }
        if (auth.role !== "admin" && exist.userId !== auth.userId) {
            return res.status(403).json({ message: "Доступ запрещён" });
        }

        const payload: any = {};
        if (req.body.serviceId) payload.serviceId = Number(req.body.serviceId);
        if (req.body.barberId) payload.barberId = Number(req.body.barberId);
        if (req.body.date) {
            const d = new Date(req.body.date);
            if (d < new Date()) {
                return res.status(400).json({ message: "Нельзя установить прошедшую дату" });
            }
            payload.date = d;
        }
        if (req.body.time) payload.time = req.body.time;
        if (req.body.status) payload.status = req.body.status;

        // При изменении barber/date/time — тоже проверяем конфликт
        if (payload.barberId || payload.date || payload.time) {
            const newBarberId = payload.barberId ?? exist.barberId;
            const newDate = payload.date ?? exist.date;
            const newTime = payload.time ?? exist.time;
            const conflict = await db.appointment.findFirst({
                where: {
                    barberId: newBarberId,
                    date: newDate,
                    time: newTime,
                    NOT: { id },
                },
            });
            if (conflict) {
                return res
                    .status(409)
                    .json({ message: "Данный слот уже занят у выбранного барбера" });
            }
        }

        const updated = await db.appointment.update({
            where: { id },
            data: payload,
            include: { user: true, barber: true, service: true },
        });
        return res.json(updated);
    } catch (error: any) {
        console.error("updateAppointment:", error);
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Запись не найдена" });
        }
        return res.status(500).json({ message: "Server error" });
    }
}

/**
 * DELETE /appointments/:id
 * Только admin или владелец может удалить.
 */
export async function deleteAppointment(req: Request, res: Response) {
    try {
        const auth = (req as any).user as AuthPayload;
        const id = Number(req.params.id);

        const exist = await db.appointment.findUnique({ where: { id } });
        if (!exist) {
            return res.status(404).json({ message: "Запись не найдена" });
        }
        if (auth.role !== "admin" && exist.userId !== auth.userId) {
            return res.status(403).json({ message: "Доступ запрещён" });
        }

        await db.appointment.delete({ where: { id } });
        return res.status(204).send();
    } catch (error: any) {
        console.error("deleteAppointment:", error);
        return res.status(500).json({ message: "Server error" });
    }
}
