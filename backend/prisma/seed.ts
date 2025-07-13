import { PrismaClient, Role, AppointmentStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    // 0) Очистка всех таблиц (порядок удаления важен)
    await prisma.appointment.deleteMany();
    await prisma.portfolio.deleteMany();
    await prisma.barber.deleteMany();
    await prisma.barbershop.deleteMany();
    await prisma.service.deleteMany();
    await prisma.user.deleteMany();

    // 1) Барбершопы
    const shopsData = [
        // Москва
        {
            name: "Downtown Cuts",
            address: "ул. Ленина, 10, Москва",
            lat: 55.751244,
            lon: 37.618423,
        },
        {
            name: "City Barber",
            address: "пр. Мира, 15, Москва",
            lat: 55.780,
            lon: 37.642,
        },
        // Тюмень
        {
            name: "Stray Kids",
            address: "ул. Республики, 196, Тюмень",
            lat: 57.1432,
            lon: 61.4385,
        },
        {
            name: "Tumen Style",
            address: "пр. Победы, 50, Тюмень",
            lat: 57.1425,
            lon: 61.4370,
        },
    ];
    const barbershops = await Promise.all(
        shopsData.map((data) => prisma.barbershop.create({ data }))
    );

    // 2) Мастера
    const barbersData = [
        // Москва
        {
            name: "John Doe",
            specialization: "Haircut",
            rating: 4.5,
            barbershopId: barbershops[0].id,
        },
        {
            name: "Jane Smith",
            specialization: "Coloring",
            rating: 4.8,
            barbershopId: barbershops[1].id,
        },
        {
            name: "Mike Brown",
            specialization: "Beard Trim",
            rating: 4.2,
            barbershopId: barbershops[0].id,
        },
        // Тюмень
        {
            name: "Алексей Петров",
            specialization: "Стрижка под ноль",
            rating: 4.7,
            barbershopId: barbershops[2].id,
        },
        {
            name: "Елена Смирнова",
            specialization: "Укладка",
            rating: 4.9,
            barbershopId: barbershops[3].id,
        },
    ];
    const barbers = await Promise.all(
        barbersData.map((data) => prisma.barber.create({ data }))
    );

    // 3) Услуги
    const servicesData = [
        { name: "Standard Haircut", description: "Basic cut", duration: 30, price: 25.0 },
        { name: "Beard Trim", description: "Shape beard", duration: 20, price: 15.0 },
        { name: "Hair Coloring", description: "Full color", duration: 90, price: 60.0 },
        { name: "Kids Haircut", description: "Kids style", duration: 25, price: 20.0 },
        // Новые услуги для Тюмени
        { name: "Стрижка под ноль", description: "Стильная стрижка", duration: 45, price: 35.0 },
        { name: "Укладка", description: "Профессиональная укладка", duration: 30, price: 25.0 },
    ];
    const services = await Promise.all(
        servicesData.map((data) => prisma.service.create({ data }))
    );

    // 4) Пользователи (user + admin)
    const hash = await bcrypt.hash("password123", 10);
    const [user, admin, tyumenUser] = await Promise.all([
        prisma.user.create({
            data: {
                name: "Test User",
                email: "user@example.com",
                password: hash,
                phone: "+1234567890",
                role: Role.USER,
            },
        }),
        prisma.user.create({
            data: {
                name: "Admin User",
                email: "admin@example.com",
                password: hash,
                role: Role.ADMIN,
            },
        }),
        prisma.user.create({
            data: {
                name: "Тюменский Клиент",
                email: "tyumen@example.com",
                password: hash,
                phone: "+79991234567",
                role: Role.USER,
            },
        }),
    ]);

    // 5) Портфолио
    const portfolioData = [
        { imageUrl: "/classic.jpg", description: "Классическая стрижка" },
        { imageUrl: "/fade.jpg", description: "Барбершоп Fade" },
        { imageUrl: "/cut.jpg", description: "Укладка бороды" },
        { imageUrl: "/kids.jpg", description: "Детская стрижка" },
    ];
    await Promise.all(
        portfolioData.map((data) => prisma.portfolio.create({ data }))
    );

    // 6) Записи
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const threeDays = new Date();
    threeDays.setDate(threeDays.getDate() + 3);

    await prisma.appointment.createMany({
        data: [
            // Москва
            {
                userId: user.id,
                barberId: barbers[0].id,
                serviceId: services[0].id,
                date: tomorrow,
                time: "10:00",
                status: AppointmentStatus.CONFIRMED,
            },
            {
                userId: user.id,
                barberId: barbers[1].id,
                serviceId: services[1].id,
                date: threeDays,
                time: "14:30",
                status: AppointmentStatus.NEW,
            },
            // Тюмень
            {
                userId: tyumenUser.id,
                barberId: barbers[3].id,
                serviceId: services[4].id,
                date: tomorrow,
                time: "11:00",
                status: AppointmentStatus.CONFIRMED,
            },
            {
                userId: tyumenUser.id,
                barberId: barbers[4].id,
                serviceId: services[5].id,
                date: threeDays,
                time: "15:00",
                status: AppointmentStatus.NEW,
            },
        ],
    });

    console.log("✅ Seed completed");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });