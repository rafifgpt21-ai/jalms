
import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    console.log("⚠️  STARTING DATABASE RESET ⚠️")

    // 1. Delete all data from all models
    // Order matters somewhat if there are strict relation constraints, 
    // but for MongoDB mostly it's fine. We'll try to delete children first.

    console.log("🗑️  Emptying database tables...")

    // Activity/Transaction related
    await prisma.submission.deleteMany({})
    await prisma.attendance.deleteMany({})
    await prisma.materialAssignment.deleteMany({})
    await prisma.schedule.deleteMany({})
    await prisma.enrollment.deleteMany({})
    await prisma.message.deleteMany({})

    // Content/Structure related
    await prisma.assignment.deleteMany({})
    await prisma.material.deleteMany({})
    await prisma.course.deleteMany({})
    await prisma.class.deleteMany({})
    await prisma.subject.deleteMany({})
    await prisma.term.deleteMany({})
    await prisma.academicYear.deleteMany({})
    await prisma.conversation.deleteMany({})

    // Users
    await prisma.user.deleteMany({})

    console.log("✅ Database emptied.")

    // 2. Create Admin User
    console.log("👤 Creating Admin user...")

    const rawPassword = "admin2138"
    const hashedPassword = await bcrypt.hash(rawPassword, 10)

    const admin = await prisma.user.create({
        data: {
            name: "Admin",
            email: "admin@jalms.com",
            password: hashedPassword,
            roles: [Role.ADMIN],
            isActive: true, // Ensuring the admin is active
        }
    })

    console.log(`
🎉 Database reset complete!
----------------------------------
Admin Account Created:
Name:     ${admin.name}
Email:    ${admin.email}
Password: ${rawPassword}
----------------------------------
`)

}

main()
    .catch((e) => {
        console.error("❌ Error during reset:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
