import express from "express";
import { PrismaClient, Role } from "@prisma/client";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/requireRole";
const prisma = new PrismaClient();

const r = express.Router();

r.get("/", async (_: express.Request, res: express.Response) => {
    const items = await prisma.portfolio.findMany({ orderBy: { createdAt: "desc" } });
    res.json(items);
});

r.post("/", authMiddleware, requireRole(Role.ADMIN), async (req: express.Request, res: express.Response) => {
    const item = await prisma.portfolio.create({ data: req.body });
    res.json(item);
});

r.delete("/:id", authMiddleware, requireRole(Role.ADMIN), async (req: express.Request, res: express.Response) => {
    await prisma.portfolio.delete({ where: { id: +req.params.id } });
    res.sendStatus(204);
});

export default r;
