
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.findFirst({
        where: { name: { contains: "Saiful Bahri" } }
    })

    if (!user) {
        console.log("User 'Saiful Bahri' not found")
        return
    }

    console.log("Found User:", user.id, user.name, user.roles)

    const courses = await prisma.course.findMany({
        where: { teacherId: user.id },
        include: { teacher: true }
    })

    console.log("Courses for teacherId =", user.id)
    courses.forEach(c => {
        console.log(`- ${c.name} (Teacher Name in relation: ${c.teacher.name})`)
    })

    // Also check if there's any course where teacher name is Sulthon but teacherId is Saiful
    const sulthon = await prisma.user.findFirst({
        where: { name: { contains: "Sulthon" } }
    })
    if (sulthon) {
        console.log("Found Sulthon:", sulthon.id, sulthon.name)
        const sulthonCourses = await prisma.course.findMany({
            where: { teacherId: sulthon.id }
        })
        console.log("Courses for Sulthon:")
        sulthonCourses.forEach(c => console.log(`- ${c.name}`))
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
