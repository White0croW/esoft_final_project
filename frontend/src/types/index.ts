import { ReactNode } from "react";

export enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN'
}

export enum AppointmentStatus {
    NEW = "NEW",
    CONFIRMED = "CONFIRMED",
    DONE = "DONE",
    CANCELED = "CANCELED"
}

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: Role;
    password?: string;
    createdAt: string;
}

export interface UserProfile {
    id: number;
    name: string;
    email: string;
    phone?: string;
    token?: string;
}

export type UserCreateData = Omit<User, 'id' | 'createdAt'> & { password: string };
export type UserUpdateData = Partial<Omit<UserCreateData, 'password'>> & { password?: string };

export interface BarberShop {
    id: number;
    name: string;
    address: string;
    lat: number;
    lon: number;
    createdAt: string;
    barbers: Barber[];
}

export interface Barber {
    id: number;
    name: string;
    specialization: string | null;
    rating: number;
    barbershopId?: number;
    barbershop?: BarberShop;
    services: Service[];
    createdAt: string;
}

export interface Service {
    id: number;
    name: string;
    description: string | null;
    duration: number; // в минутах
    price: number;
    createdAt: string;
}

export interface Appointment {
    id: number;
    userId: number;
    serviceId: number;
    barberId: number;
    date: string; // Дата в формате ISO
    startTime: string; // Формат "HH:MM"
    endTime: string; // Формат "HH:MM"
    status: AppointmentStatus;
    createdAt: string;

    // Связанные объекты
    user?: User;
    service: Service;
    barber: Barber;
    barbershop: BarberShop;
}

export interface PortfolioItem {
    id: number;
    imageUrl: string;
    description: string;
    createdAt: string;
}

// Дополнительные интерфейсы для расписаний
export enum DayOfWeek {
    MONDAY = "MONDAY",
    TUESDAY = "TUESDAY",
    WEDNESDAY = "WEDNESDAY",
    THURSDAY = "THURSDAY",
    FRIDAY = "FRIDAY",
    SATURDAY = "SATURDAY",
    SUNDAY = "SUNDAY"
}

export interface BarbershopSchedule {
    id: number;
    barbershopId: number;
    dayOfWeek: DayOfWeek;
    openingTime: string; // "HH:MM"
    closingTime: string; // "HH:MM"
    isWorking: boolean;
}

export interface BarberSchedule {
    id: number;
    barberId: number;
    dayOfWeek: DayOfWeek;
    startTime: string; // "HH:MM"
    endTime: string; // "HH:MM"
    isWorking: boolean;
}

export interface TimeSlot {
    start: string; // "HH:MM"
    end: string;   // "HH:MM"
}