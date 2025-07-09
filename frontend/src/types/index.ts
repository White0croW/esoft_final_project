export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    phone?: string;
    createdAt: string;
}

export interface Service {
    id: number;
    name: string;
    description?: string;
    duration: number;
    price: number;
}

export interface Barber {
    id: number;
    name: string;
    experience: number;
    avatarUrl?: string;
}

export interface Appointment {
    id: number;
    serviceId: number;
    barberId: number;
    date: string;
    time: string;
    serviceName: string;
    barberName: string;
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

