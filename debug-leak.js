
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("\n--- Courses ---")
    const courses = await prisma.course.findMany({
        where: {
            OR: [
                { name: "Math 12" },
                { name: "It" },
                { name: "Math 7" },
                { name: "History 12" },
                { name: "Hitory 10" }
            ]
        },
        include: {
            teacher: { select: { id: true, name: true } },
            term: { select: { isActive: true } }
        }
    })

    courses.forEach(c => {
        console.log(`Course: ${c.name} (${c.id})`)
        console.log(`  Teacher: ${c.teacher.name} (${c.teacher.id})`)
        console.log(`  TeacherId Field: ${c.teacherId}`)
        console.log(`  DeletedAt: ${c.deletedAt}`)
        console.log(`  Term Active: ${c.term?.isActive}`)
        console.log('---')
    })

    console.log("\n--- Assignments for Math 12 ---")
    const math12 = courses.find(c => c.name === "Math 12") // Just pick first one
    if (math12) {
        const assignments = await prisma.assignment.findMany({
            where: { courseId: math12.id }
        })
        console.log(`Found ${assignments.length} assignments for Math 12`)
        assignments.forEach(a => console.log(`- ${a.title}`))
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
