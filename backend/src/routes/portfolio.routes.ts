import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/requireRole";
const prisma = new PrismaClient();
const r = Router();

r.get("/", async (_, res) => {
    const items = await prisma.portfolio.findMany({ orderBy: { createdAt: "desc" } });
    res.json(items);
});

r.post("/", authMiddleware, requireRole("admin"), async (req, res) => {
    const item = await prisma.portfolio.create({ data: req.body });
    res.json(item);
});

r.delete("/:id", authMiddleware, requireRole("admin"), async (req, res) => {
    await prisma.portfolio.delete({ where: { id: +req.params.id } });
    res.sendStatus(204);
});

export default r;
