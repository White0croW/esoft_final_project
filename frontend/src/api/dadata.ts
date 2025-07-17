import api from "./base";
import { PortfolioItem } from "../types";

export const fetchDadata = () =>
    api.get<PortfolioItem[]>("/portfolio").then((res) => res.data);
