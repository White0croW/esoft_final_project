import express, { Request, Response, NextFunction } from "express";
import path from "path";
import process from 'node:process';
import cors, { CorsOptions } from "cors";
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

// Конфигурация CORS
const allowedOrigins: string[] = [];

if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

if (process.env.NODE_ENV === 'production') {
    // Добавляем дополнительные домены для продакшена
    allowedOrigins.push(
        'https://esoft-final-project.vercel.app',
        'https://esoft-final-project-marks-projects-531ff81c.vercel.app',
        'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address'
    );
} else {
    allowedOrigins.push('http://localhost:3000');
}

const corsOptions: CorsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (_: Request, res: Response) => {
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
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);

    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ error: 'CORS Error: Access denied' });
    }

    res.status(500).json({ error: 'Internal Server Error' });
});

// Для Render.com: Проверка PORT
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`API: http://localhost:${PORT}/api`);
    console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});