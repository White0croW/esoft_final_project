import api from "./base";
import { BarberShop } from "../types";

export const getBarbershops = (token: string) =>
    api.get<BarberShop[]>("/barbershops").then((res) => res.data);
