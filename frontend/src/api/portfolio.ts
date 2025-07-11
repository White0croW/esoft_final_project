import api from "./base";
import { PortfolioItem } from "../types";

export const getPortfolio = () =>
    api.get<PortfolioItem[]>("/portfolio").then((res) => res.data);
