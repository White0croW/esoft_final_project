// barber.controller.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

interface AuthPayload {
    userId: number;
    role: string;
}

/**
 * GET /barbers
 * query: name?, specialization?, minRating?, maxRating?
 */
export async function listBarbers(req: Request, res: Response) {
    try {
        const { name, specialization, minRating, maxRating } = req.query;
        const where: any = {};

        if (name) {
            where.name = { contains: String(name), mode: "insensitive" };
        }
        if (specialization) {
            where.specialization = { contains: String(specialization), mode: "insensitive" };
        }
        if (minRating || maxRating) {
            where.rating = {};
            if (minRating) where.rating.gte = Number(minRating);
            if (maxRating) where.rating.lte = Number(maxRating);
        }

        const barbers = await db.barber.findMany({
            where,
            orderBy: { name: "asc" },
        });
        return res.json(barbers);
    } catch (error) {
        console.error("listBarbers:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

/**
 * GET /barbers/:id
 */
export async function getBarber(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const barber = await db.barber.findUnique({ where: { id } });
        if (!barber) {
            return res.status(404).json({ message: "Barber not found" });
        }
        return res.json(barber);
    } catch (error) {
        console.error("getBarber:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

/**
 * POST /barbers
 * Только admin
 */
export async function createBarber(req: Request, res: Response) {
    try {
        const auth = (req as any).user as AuthPayload;
        if (auth.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }

        const { name, specialization, rating } = req.body;
        const barber = await db.barber.create({
            data: { name, specialization, rating },
        });
        return res.status(201).json(barber);
    } catch (error) {
        console.error("createBarber:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

/**
 * PUT /barbers/:id
 * Только admin
 */
export async function updateBarber(req: Request, res: Response) {
    try {
        const auth = (req as any).user as AuthPayload;
        if (auth.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }

        const id = Number(req.params.id);
        const payload: any = {};
        const { name, specialization, rating } = req.body;
        if (name !== undefined) payload.name = name;
        if (specialization !== undefined) payload.specialization = specialization;
        if (rating !== undefined) payload.rating = rating;

        const barber = await db.barber.update({
            where: { id },
            data: payload,
        });
        return res.json(barber);
    } catch (error: any) {
        console.error("updateBarber:", error);
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Barber not found" });
        }
        return res.status(500).json({ message: "Server error" });
    }
}

/**
 * DELETE /barbers/:id
 * Только admin
 */
export async function deleteBarber(req: Request, res: Response) {
    try {
        const auth = (req as any).user as AuthPayload;
        if (auth.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }

        const id = Number(req.params.id);
        await db.barber.delete({ where: { id } });
        return res.status(204).send();
    } catch (error: any) {
        console.error("deleteBarber:", error);
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Barber not found" });
        }
        return res.status(500).json({ message: "Server error" });
    }
}
