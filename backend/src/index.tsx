import express, { Request, Response, NextFunction } from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import barbershopsRouter from "./routes/barbershops.routes";
import barberRouter from "./routes/barber.routes";
import portfolioRouter from "./routes/portfolio.routes";
import dadataRoutes from "./routes/dadata.routes";
import appointmentRoutes from "./routes/appointment.routes";

dotenv.config();
const app = express();

app.use(
    cors({
        origin: "http://localhost:3000", // Адрес фронта
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);
app.use(express.json());

// 1) Роуты API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/barbershops", barbershopsRouter);
app.use("/api/barbers", barberRouter);
app.use("/api/portfolio", portfolioRouter);
app.use("/api", dadataRoutes);
app.use("/api/appointments", appointmentRoutes);

/// Статика фронта
const distPath = path.resolve(__dirname, "../../frontend/dist");
app.use(express.static(distPath));

// Все остальные GET-запросы — на index.html
app.get("*", (_, res) => {
    res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
