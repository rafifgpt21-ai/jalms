import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

async function main() {
    console.log("--- Debugging Class Data ---")

    // 1. Check Terms
    console.log("\n1. Checking Terms...")
    const allTerms = await db.term.findMany()
    console.log(`Total Terms in DB: ${allTerms.length}`)
    allTerms.forEach(t => console.log(`- ID: ${t.id}, Type: ${t.type}, Active: ${t.isActive}, Deleted: ${t.deletedAt}`))

    const activeTerms = await db.term.findMany({
        where: { deletedAt: null },
        include: { academicYear: true }
    })
    console.log(`Terms matching 'deletedAt: null': ${activeTerms.length}`)

    // 2. Check Teachers
    console.log("\n2. Checking Homeroom Teachers...")
    const allTeachers = await db.user.findMany({
        where: {
            roles: { has: "HOMEROOM_TEACHER" }
        }
    })
    console.log(`Total Homeroom Teachers in DB: ${allTeachers.length}`)
    allTeachers.forEach(t => console.log(`- Name: ${t.name}, Active: ${t.isActive}, Deleted: ${t.deletedAt}`))

    const validTeachers = await db.user.findMany({
        where: {
            roles: { has: "HOMEROOM_TEACHER" },
            deletedAt: null,
            isActive: true
        }
    })
    console.log(`Teachers matching filters (Active + Not Deleted): ${validTeachers.length}`)
}

main()
    .catch(console.error)
    .finally(() => db.$disconnect())
