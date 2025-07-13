import { PrismaClient, Role, AppointmentStatus, DayOfWeek } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    // 0) Очистка всех таблиц с учетом зависимостей
    await prisma.appointment.deleteMany();
    await prisma.barberSchedule.deleteMany();
    await prisma.barbershopSchedule.deleteMany();
    await prisma.portfolio.deleteMany();
    await prisma.barber.deleteMany();
    await prisma.barbershop.deleteMany();
    await prisma.service.deleteMany();
    await prisma.user.deleteMany();

    // 1) Создаем пользователей
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

    // 2) Создаем барбершопы
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

    // 3) Добавляем расписания для барбершопов
    const shopScheduleDays = [
        DayOfWeek.MONDAY,
        DayOfWeek.TUESDAY,
        DayOfWeek.WEDNESDAY,
        DayOfWeek.THURSDAY,
        DayOfWeek.FRIDAY,
        DayOfWeek.SATURDAY,
        DayOfWeek.SUNDAY,
    ];

    for (const shop of barbershops) {
        for (const day of shopScheduleDays) {
            const isWorking = day !== DayOfWeek.SUNDAY;
            await prisma.barbershopSchedule.create({
                data: {
                    barbershopId: shop.id,
                    dayOfWeek: day,
                    openingTime: isWorking ? "09:00" : "00:00",
                    closingTime: isWorking ? "21:00" : "00:00",
                    isWorking,
                },
            });
        }
    }

    // 4) Создаем услуги
    const servicesData = [
        { name: "Standard Haircut", description: "Basic cut", duration: 30, price: 25.0 },
        { name: "Beard Trim", description: "Shape beard", duration: 20, price: 15.0 },
        { name: "Hair Coloring", description: "Full color", duration: 90, price: 60.0 },
        { name: "Kids Haircut", description: "Kids style", duration: 25, price: 20.0 },
        { name: "Стрижка под ноль", description: "Стильная стрижка", duration: 45, price: 35.0 },
        { name: "Укладка", description: "Профессиональная укладка", duration: 30, price: 25.0 },
    ];
    const services = await Promise.all(
        servicesData.map((data) => prisma.service.create({ data }))
    );

    // 5) Создаем барберов и привязываем услуги
    const barbersData = [
        {
            name: "John Doe",
            specialization: "Haircut",
            rating: 4.5,
            barbershopId: barbershops[0].id,
            serviceIds: [services[0].id, services[1].id]
        },
        {
            name: "Jane Smith",
            specialization: "Coloring",
            rating: 4.8,
            barbershopId: barbershops[1].id,
            serviceIds: [services[2].id, services[3].id]
        },
        {
            name: "Mike Brown",
            specialization: "Beard Trim",
            rating: 4.2,
            barbershopId: barbershops[0].id,
            serviceIds: [services[1].id, services[3].id]
        },
        {
            name: "Алексей Петров",
            specialization: "Стрижка под ноль",
            rating: 4.7,
            barbershopId: barbershops[2].id,
            serviceIds: [services[4].id, services[0].id]
        },
        {
            name: "Елена Смирнова",
            specialization: "Укладка",
            rating: 4.9,
            barbershopId: barbershops[3].id,
            serviceIds: [services[5].id, services[2].id]
        },
    ];

    const barbers: Awaited<ReturnType<typeof prisma.barber.create>>[] = [];
    for (const data of barbersData) {
        const { serviceIds, ...barberData } = data;
        const barber = await prisma.barber.create({
            data: {
                ...barberData,
                services: {
                    connect: serviceIds.map(id => ({ id }))
                }
            }
        });
        barbers.push(barber);
    }

    // 6) Добавляем расписания для барберов
    for (const barber of barbers) {
        for (const day of shopScheduleDays) {
            const isWorking = day !== DayOfWeek.SUNDAY;
            await prisma.barberSchedule.create({
                data: {
                    barberId: barber.id,
                    dayOfWeek: day,
                    startTime: isWorking ? "10:00" : "00:00",
                    endTime: isWorking ? "19:00" : "00:00",
                    isWorking,
                },
            });
        }
    }

    // 7) Создаем портфолио
    const portfolioData = [
        { imageUrl: "/classic.jpg", description: "Классическая стрижка" },
        { imageUrl: "/fade.jpg", description: "Барбершоп Fade" },
        { imageUrl: "/cut.jpg", description: "Укладка бороды" },
        { imageUrl: "/kids.jpg", description: "Детская стрижка" },
    ];
    await Promise.all(
        portfolioData.map((data) => prisma.portfolio.create({ data }))
    );

    // 8) Создаем записи с расчетом endTime
    const calculateEndTime = (startTime: string, duration: number): string => {
        const [hours, minutes] = startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + duration;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
    };

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Сбрасываем время

    const threeDays = new Date();
    threeDays.setDate(threeDays.getDate() + 3);
    threeDays.setHours(0, 0, 0, 0);

    const appointmentsData = [
        // Москва
        {
            userId: user.id,
            barberId: barbers[0].id,
            serviceId: services[0].id,
            date: tomorrow,
            startTime: "10:00",
            status: AppointmentStatus.CONFIRMED,
        },
        {
            userId: user.id,
            barberId: barbers[1].id,
            serviceId: services[1].id,
            date: threeDays,
            startTime: "14:30",
            status: AppointmentStatus.NEW,
        },
        // Тюмень
        {
            userId: tyumenUser.id,
            barberId: barbers[3].id,
            serviceId: services[4].id,
            date: tomorrow,
            startTime: "11:00",
            status: AppointmentStatus.CONFIRMED,
        },
        {
            userId: tyumenUser.id,
            barberId: barbers[4].id,
            serviceId: services[5].id,
            date: threeDays,
            startTime: "15:00",
            status: AppointmentStatus.NEW,
        },
    ];

    for (const appt of appointmentsData) {
        const service = services.find(s => s.id === appt.serviceId);
        if (!service) {
            console.error(`Service with id ${appt.serviceId} not found`);
            continue;
        }
        const endTime = calculateEndTime(appt.startTime, service.duration);

        await prisma.appointment.create({
            data: {
                ...appt,
                endTime: calculateEndTime(appt.startTime, service.duration)
            }
        });
    }

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