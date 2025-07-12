export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    phone?: string;
    createdAt: string;
}

export interface UserProfile {
    id: number;
    name: string;
    email: string;
    phone?: string;
    token?: string;
}

export interface BarberShop {
    id: number;
    name: string;
    address: string;
    lat: number;
    lon: number;
    masterName: string;
}

export interface PortfolioItem {
    id: number;
    imageUrl: string;
    description: string;
}

