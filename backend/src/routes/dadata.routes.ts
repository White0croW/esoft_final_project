// backend/src/routes/dadata.routes.ts
import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/suggest/address", async (req, res) => {
    const { query } = req.body;
    try {
        const response = await fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Token ${process.env.DADATA_TOKEN}`
            },
            body: JSON.stringify({ query, count: 5 }),
        });

        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Ошибка при запросе к Dadata" });
    }
});

export default router;
