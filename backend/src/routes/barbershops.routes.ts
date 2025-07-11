import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/requireRole";
const prisma = new PrismaClient();
const r = Router();

// public
r.get("/", async (_, res) => {
    const shops = await prisma.barbershop.findMany({
        include: { barbers: { select: { name: true } } }
    });
    res.json(shops.map(s => ({
        id: s.id, name: s.name, address: s.address,
        lat: s.lat, lon: s.lon,
        masterName: s.barbers[0]?.name || ""
    })));
});

// admin only
r.post("/", authMiddleware, requireRole("admin"), async (req, res) => {
    const shop = await prisma.barbershop.create({ data: req.body });
    res.json(shop);
});
r.put("/:id", authMiddleware, requireRole("admin"), async (req, res) => {
    const shop = await prisma.barbershop.update({
        where: { id: +req.params.id }, data: req.body
    });
    res.json(shop);
});
r.delete("/:id", authMiddleware, requireRole("admin"), async (req, res) => {
    await prisma.barbershop.delete({ where: { id: +req.params.id } });
    res.sendStatus(204);
});

export default r;
