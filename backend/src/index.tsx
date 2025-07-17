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
import adminRouter from './routes/admin.routes';

dotenv.config();
const app = express();

// Конфигурация CORS для продакшена
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [
        process.env.FRONTEND_URL,
        'https://esoftfinalprojectprod.vercel.app/' // Замените на реальный URL фронта
    ]
    : ['http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (_, res) => {
    res.status(200).json({ status: 'ok' });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/barbershops", barbershopsRouter);
app.use("/api/barbers", barberRouter);
app.use("/api/portfolio", portfolioRouter);
app.use("/api", dadataRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use('/api/admin', adminRouter);

// Обработка ошибок
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Для Render.com: Проверка PORT
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`API: http://localhost:${PORT}/api`);
    console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});