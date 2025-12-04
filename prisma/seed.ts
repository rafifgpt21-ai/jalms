import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    // 1. Create Academic Year
    // We use upsert to avoid duplicates if run multiple times
    // But for simplicity in this "no-transaction" fix, we'll check if it exists first
    let academicYear = await prisma.academicYear.findFirst({
        where: { name: "2024/2025" }
    })

    if (!academicYear) {
        academicYear = await prisma.academicYear.create({
            data: {
                name: "2024/2025",
                startDate: new Date("2024-07-15"),
                endDate: new Date("2025-06-20"),
                isActive: true,
            }
        })
        console.log(`✅ Created Academic Year: ${academicYear.name}`)

        // Create Terms separately to avoid nested write transactions
        await prisma.term.createMany({
            data: [
                { name: "Semester 1", academicYearId: academicYear.id },
                { name: "Semester 2", academicYearId: academicYear.id },
            ]
        })
        console.log(`✅ Created Terms for ${academicYear.name}`)
    } else {
        console.log(`ℹ️ Academic Year ${academicYear.name} already exists.`)
    }

    const hashedPassword = await bcrypt.hash("admin123", 10)

    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
        where: { email: "admin@jalms.com" }
    })

    if (!existingAdmin) {
        const admin = await prisma.user.create({
            data: {
                email: "admin@jalms.com",
                name: "Super Admin",
                password: hashedPassword,
                roles: [Role.ADMIN],
            },
        })
        console.log(`✅ Created Admin User: ${admin.email}`)
    } else {
        console.log(`ℹ️ Admin user already exists.`)
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
