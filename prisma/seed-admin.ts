import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    const password = await bcrypt.hash("admin2138", 10)

    const admin = await prisma.user.upsert({
        where: { email: "admin@jalms.com" },
        update: {
            name: "Super Admin",
            password,
            roles: [Role.ADMIN],
            isActive: true,
        },
        create: {
            email: "admin@jalms.com",
            name: "Super Admin",
            password,
            roles: [Role.ADMIN],
            isActive: true,
        },
    })

    console.log(`Admin seed complete: ${admin.email}`)
}

main()
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
