import api from "./base";
import { PortfolioItem } from "../types";

export const fetchPortfolio = () =>
    api.get<PortfolioItem[]>("/portfolio").then((res) => res.data);
