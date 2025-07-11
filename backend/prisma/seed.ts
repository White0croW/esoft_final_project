// prisma/seed.ts
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
    ];
    const barbershops = await Promise.all(
        shopsData.map((data) =>
            prisma.barbershop.create({ data })
        )
    );

    // 2) Мастера
    const barbersData = [
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
    ];
    const barbers = await Promise.all(
        barbersData.map((data) =>
            prisma.barber.create({ data })
        )
    );

    // 3) Услуги
    const servicesData = [
        { name: "Standard Haircut", description: "Basic cut", duration: 30, price: 25.0 },
        { name: "Beard Trim", description: "Shape beard", duration: 20, price: 15.0 },
        { name: "Hair Coloring", description: "Full color", duration: 90, price: 60.0 },
        { name: "Kids Haircut", description: "Kids style", duration: 25, price: 20.0 },
    ];
    const services = await Promise.all(
        servicesData.map((data) =>
            prisma.service.create({ data })
        )
    );

    // 4) Пользователи (user + admin)
    const hash = await bcrypt.hash("password123", 10);
    const [user, admin] = await Promise.all([
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
    ]);

    // 5) Портфолио
    const portfolioData = [
        { imageUrl: "/portfolio/1.jpg", description: "Классическая стрижка" },
        { imageUrl: "/portfolio/2.jpg", description: "Барбершоп Fade" },
        { imageUrl: "/portfolio/3.jpg", description: "Укладка бороды" },
        { imageUrl: "/portfolio/4.jpg", description: "Детская стрижка" },
    ];
    await Promise.all(
        portfolioData.map((data) =>
            prisma.portfolio.create({ data })
        )
    );

    // 6) Записи
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const threeDays = new Date();
    threeDays.setDate(threeDays.getDate() + 3);

    await prisma.appointment.createMany({
        data: [
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
