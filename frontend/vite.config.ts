// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            // "jwt-decode": path.resolve(
            //     __dirname,
            //     "node_modules/jwt-decode/build/cjs/index.js"
            // ),
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        port: 5173,
        proxy: {
            // все запросы, начинающиеся с /auth, /services, /barbers, /appointments, /users
            // будут проксироваться на ваш бэкенд
            "^/(auth|services|barbers|appointments|users)": {
                target: process.env.VITE_API_URL,
                changeOrigin: true,
            },
        },
    },
    optimizeDeps: {
        include: ["jwt-decode"],
    },
});
