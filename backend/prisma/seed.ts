import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    // 0) Очистка таблиц (порядок важен из-за связей)
    await prisma.appointment.deleteMany()
    await prisma.user.deleteMany()
    await prisma.service.deleteMany()
    await prisma.barber.deleteMany()

    // 1) Барберы
    const barbersData = [
        { name: 'John Doe', specialization: 'Haircut', rating: 4.5 },
        { name: 'Jane Smith', specialization: 'Coloring', rating: 4.8 },
        { name: 'Mike Brown', specialization: 'Beard Trim', rating: 4.2 },
    ]
    const barbers = []
    for (const b of barbersData) {
        const rec = await prisma.barber.create({ data: b })
        barbers.push(rec)
    }

    // 2) Услуги
    const servicesData = [
        { name: 'Standard Haircut', description: 'Basic cut', duration: 30, price: 25.0 },
        { name: 'Beard Trim', description: 'Shape beard', duration: 20, price: 15.0 },
        { name: 'Hair Coloring', description: 'Full color', duration: 90, price: 60.0 },
        { name: 'Kids Haircut', description: 'Kids style', duration: 25, price: 20.0 },
    ]
    const services = []
    for (const s of servicesData) {
        const rec = await prisma.service.create({ data: s })
        services.push(rec)
    }

    // 3) Тестовый пользователь
    const passwordHash = await bcrypt.hash('password123', 10)
    const user = await prisma.user.create({
        data: {
            name: 'Test User',
            email: 'test@example.com',
            password: passwordHash,
            phone: '+1234567890',
            // роль и createdAt проставятся по-умолчанию
        },
    })

    // 4) Записи на приём
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const threeDays = new Date()
    threeDays.setDate(threeDays.getDate() + 3)

    await prisma.appointment.createMany({
        data: [
            {
                userId: user.id,
                barberId: barbers[0].id,
                serviceId: services[0].id,
                date: tomorrow,
                time: '10:00',
                status: 'confirmed',
            },
            {
                userId: user.id,
                barberId: barbers[1].id,
                serviceId: services[1].id,
                date: threeDays,
                time: '14:30',
                status: 'pending',
            },
        ],
    })

    console.log('✅ Seed completed')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
