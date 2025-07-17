// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    plugins: [
        react(),
        // Добавляем плагин для корректной обработки preload
        {
            name: 'configure-response-headers',
            configureServer: (server) => {
                server.middlewares.use((_req, res, next) => {
                    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
                    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
                    next();
                });
            },
        },
    ],
    resolve: {
        alias: {
            // "jwt-decode": path.resolve(
            //     __dirname,
            //     "node_modules/jwt-decode/build/cjs/index.js"
            // ),
            "@": path.resolve(__dirname, "./src"),
        },
    },
    proxy: {
        "/api": {
            target: process.env.VITE_API_URL,
            changeOrigin: true,
        },
    },
    optimizeDeps: {
        include: ["jwt-decode"],
    },
});
