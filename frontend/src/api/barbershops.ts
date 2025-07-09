import { BarberShop } from "../types";
import { getAuthHeaders } from "./utils";

export async function getBarbershops(token: string) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/barbershops`, {
        headers: getAuthHeaders(token)
    });
    return res.json() as Promise<BarberShop[]>;
}
