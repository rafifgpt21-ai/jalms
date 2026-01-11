
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    const admin = await prisma.user.findUnique({
        where: { email: "admin@jalms.com" }
    })

    if (admin) {
        console.log("✅ Admin exists: admin@jalms.com")
        // We can't easily check the password hash without knowing the input, but we assume it's from seed.ts
    } else {
        console.log("⚠️ Admin NOT found. Creating one...")
        const hashedPassword = await bcrypt.hash("admin123", 10)
        await prisma.user.create({
            data: {
                email: "admin@jalms.com",
                name: "Super Admin",
                password: hashedPassword,
                roles: ["ADMIN"],
                isActive: true
            }
        })
        console.log("✅ Admin created: admin@jalms.com / admin123")
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
