import api from "./base";
import { BarberShop } from "../types";

export const getBarbershops = () =>
    api.get<BarberShop[]>("/barbershops").then((res) => res.data);
