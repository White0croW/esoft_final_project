import express, { Request, Response, NextFunction } from "express";
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
import { number } from "zod";

dotenv.config();
const app = express();

// Настройка CORS для продакшена
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL || 'https://your-frontend-domain.com'
        : 'http://localhost:3000',
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/barbershops", barbershopsRouter);
app.use("/api/barbers", barberRouter);
app.use("/api/portfolio", portfolioRouter);
app.use("/api", dadataRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use('/api/admin', adminRouter);

// Health check endpoint
app.get("/health", (_, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Root endpoint
app.get("/", (_, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>BarberShop API</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background-color: #f5f5f5;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          h1 { color: #333; }
          p { color: #666; }
          .endpoints {
            text-align: left;
            margin-top: 30px;
          }
          .endpoint {
            background: #f9f9f9;
            padding: 10px;
            margin: 5px 0;
            border-left: 4px solid #4CAF50;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>BarberShop Management System API</h1>
          <p>Server is running successfully 🚀</p>
          <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
          
          <div class="endpoints">
            <h3>Available Endpoints:</h3>
            <div class="endpoint"><strong>GET</strong> /api/barbershops - List barbershops</div>
            <div class="endpoint"><strong>POST</strong> /api/auth/login - User login</div>
            <div class="endpoint"><strong>GET</strong> /api/users - List users</div>
            <div class="endpoint"><strong>GET</strong> /health - System health check</div>
            <div class="endpoint"><strong>GET</strong> /api/appointments - List appointments</div>
            <!-- Добавьте другие эндпоинты по необходимости -->
          </div>
          
          <p style="margin-top: 30px;">
            <a href="/api/barbershops">View barbershops</a> | 
            <a href="/health">Check health</a>
          </p>
        </div>
      </body>
    </html>
  `);
});

const PORT = 4000;
app.listen(PORT, '0.0.0.0', () =>
    console.log(`Server running on port ${PORT}`)
);