import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

interface AuthPayload {
    userId: number;
    role: string;
}

/**
 * GET /services
 * Опциональные query-параметры:
 *   - name (подстрока)
 *   - minPrice, maxPrice
 *   - minDuration, maxDuration
 */
export async function listServices(req: Request, res: Response) {
    try {
        const { name, minPrice, maxPrice, minDuration, maxDuration } = req.query;
        const where: any = {};

        if (name) {
            where.name = { contains: String(name), mode: "insensitive" };
        }
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = Number(minPrice);
            if (maxPrice) where.price.lte = Number(maxPrice);
        }
        if (minDuration || maxDuration) {
            where.duration = {};
            if (minDuration) where.duration.gte = Number(minDuration);
            if (maxDuration) where.duration.lte = Number(maxDuration);
        }

        const services = await db.service.findMany({
            where,
            orderBy: { name: "asc" },
        });
        return res.json(services);
    } catch (error) {
        console.error("listServices:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

/**
 * GET /services/:id
 */
export async function getService(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const svc = await db.service.findUnique({ where: { id } });
        if (!svc) {
            return res.status(404).json({ message: "Service not found" });
        }
        return res.json(svc);
    } catch (error) {
        console.error("getService:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

/**
 * POST /services
 * Только admin
 */
export async function createService(req: Request, res: Response) {
    try {
        const auth = (req as any).user as AuthPayload;
        if (auth.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }

        const { name, description, duration, price } = req.body;
        const svc = await db.service.create({
            data: { name, description, duration, price },
        });
        return res.status(201).json(svc);
    } catch (error) {
        console.error("createService:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

/**
 * PUT /services/:id
 * Только admin
 */
export async function updateService(req: Request, res: Response) {
    try {
        const auth = (req as any).user as AuthPayload;
        if (auth.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }

        const id = Number(req.params.id);
        const payload: any = {};
        const { name, description, duration, price } = req.body;

        if (name !== undefined) payload.name = name;
        if (description !== undefined) payload.description = description;
        if (duration !== undefined) payload.duration = duration;
        if (price !== undefined) payload.price = price;

        const svc = await db.service.update({
            where: { id },
            data: payload,
        });
        return res.json(svc);
    } catch (error: any) {
        console.error("updateService:", error);
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Service not found" });
        }
        return res.status(500).json({ message: "Server error" });
    }
}

/**
 * DELETE /services/:id
 * Только admin
 */
export async function deleteService(req: Request, res: Response) {
    try {
        const auth = (req as any).user as AuthPayload;
        if (auth.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }

        const id = Number(req.params.id);
        await db.service.delete({ where: { id } });
        return res.status(204).send();
    } catch (error: any) {
        console.error("deleteService:", error);
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Service not found" });
        }
        return res.status(500).json({ message: "Server error" });
    }
}
