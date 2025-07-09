import express, { Request, Response, NextFunction } from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import appointmentRoutes from "./routes/appointment.routes";
import serviceRoutes from "./routes/service.routes";
import barberRoutes from "./routes/barber.routes";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// 1) Роуты API
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/services", serviceRoutes);
app.use("/barbers", barberRoutes);

// 2) Раздаём фронтенд (папка dist, которую создал vite build)
//    предполагаем вот такую структуру:
//    /backend
//      /dist             ← собранный фронт (npm run build в frontend)
//      /src
//      package.json
//    либо, если dist лежит в ../frontend/dist — скорректируйте путь
const distPath = path.resolve(__dirname, "../../frontend/dist");
app.use(express.static(distPath));

// 3) На все остальные GET возвращаем index.html
//    это нужно, чтобы любые router-пути на фронтенде работали по прямой ссылке
app.get("*", (_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, "index.html"));
});

// 4) Глобальный 404/500
app.use((req: Request, res: Response) => {
    res.status(404).json({ message: "Route not found" });
});
app.use((err: any, _: Request, res: Response, __: NextFunction) => {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || "Internal error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
