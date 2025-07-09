import { Request, Response } from "express";
import prisma from "@prisma/client";
import bcrypt from "bcrypt";

const { PrismaClient } = prisma;
const db = new PrismaClient();

export async function getProfile(req: Request, res: Response) {
    const { userId } = (req as any).user;
    const user = await db.user.findUnique({
        where: { id: userId },
        include: { appointments: true },
    });
    res.json(user);
}

export async function updateProfile(req: Request, res: Response) {
    const { userId } = (req as any).user;
    const { name, email, phone, password } = req.body;
    const data: any = { name, email, phone };
    if (password) data.password = await bcrypt.hash(password, 10);
    const user = await db.user.update({ where: { id: userId }, data });
    res.json(user);
}

