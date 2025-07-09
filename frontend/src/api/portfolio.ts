import { PortfolioItem } from "../types";

export async function getPortfolio() {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/portfolio`);
    return res.json() as Promise<PortfolioItem[]>;
}
