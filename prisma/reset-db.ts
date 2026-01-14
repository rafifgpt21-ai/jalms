
import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    console.log("⚠️  STARTING DATABASE RESET ⚠️")

    // 1. Delete all data from all models
    // Order matters somewhat if there are strict relation constraints, 
    // but for MongoDB mostly it's fine. We'll try to delete children first.

    console.log("🗑️  Emptying database tables...")

    // 1. Delete dependent data first (leaves)
    // Submissions depend on Assignments and Students
    console.log("   - Deleting Submissions...")
    await prisma.submission.deleteMany({})

    // Attendance depends on Courses and Students
    console.log("   - Deleting Attendance...")
    await prisma.attendance.deleteMany({})

    // MaterialAssignments depend on Materials and Courses
    console.log("   - Deleting Material Assignments...")
    await prisma.materialAssignment.deleteMany({})

    // Schedules depend on Courses
    console.log("   - Deleting Schedules...")
    await prisma.schedule.deleteMany({})

    // Enrollments depend on Classes and Students
    console.log("   - Deleting Enrollments...")
    await prisma.enrollment.deleteMany({})

    // Messages depend on Conversations and Users
    console.log("   - Deleting Messages...")
    await prisma.message.deleteMany({})

    // Quiz Questions/Choices depend on Quizzes
    console.log("   - Deleting Quiz Content...")
    await prisma.quizChoice.deleteMany({})
    await prisma.quizQuestion.deleteMany({})

    // 2. Delete mid-level data & content
    // Assignments depend on Courses and Quizzes.
    // Ensure Submissions are GONE.
    const subCount = await prisma.submission.count()
    if (subCount > 0) {
        console.warn(`WARNING: ${subCount} submissions still exist. Retrying delete...`)
        await prisma.submission.deleteMany({})
    }

    console.log("   - Deleting Assignments...")
    await prisma.assignment.deleteMany({})

    console.log("   - Deleting Materials...")
    await prisma.material.deleteMany({})

    console.log("   - Deleting Quizzes...")
    await prisma.quiz.deleteMany({})

    // 3. Delete Structural Data
    // Courses depend on Subjects, Terms, Classes, Teachers
    console.log("   - Deleting Courses...")
    await prisma.course.deleteMany({})

    // Classes depend on Terms
    console.log("   - Deleting Classes...")
    await prisma.class.deleteMany({})

    console.log("   - Deleting Subjects...")
    await prisma.subject.deleteMany({})

    console.log("   - Deleting Terms...")
    await prisma.term.deleteMany({})

    console.log("   - Deleting Academic Years...")
    await prisma.academicYear.deleteMany({})

    console.log("   - Deleting Conversations...")
    await prisma.conversation.deleteMany({})

    // 4. Users (Roots)
    console.log("   - Deleting Users...")
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
