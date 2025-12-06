
import { PrismaClient, Role, SemesterType } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    console.log("🌱 STARTING DATABASE POPULATION...")

    // 1. Ensure Academic Year & Term
    console.log("📅 Setting up Academic Year...")
    let academicYear = await prisma.academicYear.findFirst({ where: { name: "2024/2025" } })
    if (!academicYear) {
        academicYear = await prisma.academicYear.create({
            data: {
                name: "2024/2025",
                startDate: new Date("2024-07-15"),
                endDate: new Date("2025-06-20"),
                isActive: true
            }
        })
    }

    let term = await prisma.term.findFirst({ where: { academicYearId: academicYear.id, type: SemesterType.ODD } })
    if (!term) {
        term = await prisma.term.create({
            data: {
                type: SemesterType.ODD,
                startDate: new Date("2024-07-15"),
                endDate: new Date("2024-12-20"),
                isActive: true,
                academicYearId: academicYear.id
            }
        })
    }
    const termId = term.id
    console.log(`✅ Term: ${term.type} (${term.id})`)

    // 2. Create Teachers (10)
    console.log("👨‍🏫 Creating 10 Teachers...")
    const teacherPassword = await bcrypt.hash("teacher123", 10)
    const teachers = []

    for (let i = 1; i <= 10; i++) {
        const teacherEmail = `teacher${i}@jalms.com`
        // Upsert to avoid failing if they exist (though this is meant to be run after reset usually)
        const teacher = await prisma.user.upsert({
            where: { email: teacherEmail },
            update: {},
            create: {
                name: `Teacher ${i}`,
                email: teacherEmail,
                password: teacherPassword,
                roles: [Role.SUBJECT_TEACHER], // We'll upgrade some to HOMEROOM later
                isActive: true
            }
        })
        teachers.push(teacher)
    }
    console.log(`✅ Created/Found ${teachers.length} Teachers.`)

    // 3. Create Students (90)
    console.log("🎓 Creating 90 Students...")
    const studentPassword = await bcrypt.hash("student123", 10)
    const students = []

    for (let i = 1; i <= 90; i++) {
        const studentEmail = `student${i}@jalms.com`
        const student = await prisma.user.upsert({
            where: { email: studentEmail },
            update: {},
            create: {
                name: `Student ${i}`,
                email: studentEmail,
                password: studentPassword,
                roles: [Role.STUDENT],
                isActive: true,
                officialId: `STU${2024000 + i}`
            }
        })
        students.push(student)
    }
    console.log(`✅ Created/Found ${students.length} Students.`)

    // 4. Create Classes (3 Classes: 10-A, 10-B, 10-C)
    // We will assign 30 students to each class.
    // We will assign Teacher 1, 2, 3 as Homeroom Teachers.

    const classNames = ["10-A", "10-B", "10-C"]
    const classes = []

    console.log("🏫 Creating Classes & Assigning Homeroom Teachers...")

    for (let i = 0; i < classNames.length; i++) {
        const homeroomTeacher = teachers[i] // Teacher 1, 2, 3
        const className = classNames[i]

        // Upgrade role to include HOMEROOM_TEACHER
        await prisma.user.update({
            where: { id: homeroomTeacher.id },
            data: { roles: { push: Role.HOMEROOM_TEACHER } }
        })

        const cls = await prisma.class.create({
            data: {
                name: className,
                termId: termId,
                homeroomTeacherId: homeroomTeacher.id
            }
        })
        classes.push(cls)

        // Logic to assign students
        // Students 0-29 -> Class A
        // Students 30-59 -> Class B
        // Students 60-89 -> Class C
        const startIdx = i * 30
        const endIdx = startIdx + 30
        const classStudents = students.slice(startIdx, endIdx)

        // Bulk create enrollments
        const enrollmentData = classStudents.map(s => ({
            classId: cls.id,
            studentId: s.id
        }))

        await prisma.enrollment.createMany({ data: enrollmentData })

        console.log(`   -> Class ${className} created (Homeroom: ${homeroomTeacher.name}) with ${classStudents.length} students.`)
    }

    // 5. Create Courses (Subjects)
    // Let's create 5 subjects: Math, Physics, Biology, English, History
    // And assign remaining teachers (Teacher 4-10) to these courses across the 3 classes.
    // Structure: Each Class has these 5 courses.
    // Total courses = 3 Classes * 5 Subjects = 15 Courses.

    // We have 7 remaining teachers (Teachers 4-10). We'll cycle through them.

    const subjects = [
        { name: "Mathematics", code: "MAT" },
        { name: "Physics", code: "PHY" },
        { name: "Biology", code: "BIO" },
        { name: "English", code: "ENG" },
        { name: "History", code: "HIS" }
    ]

    console.log("📚 Creating Courses & Assigning Subject Teachers...")

    let teacherIdx = 3 // Start from Teacher 4 (index 3)
    let courseCount = 0

    for (const cls of classes) {
        // Fetch students enrolled in this class to add them to course.studentIds
        const enrollments = await prisma.enrollment.findMany({
            where: { classId: cls.id },
            select: { studentId: true }
        })
        const studentIds = enrollments.map(e => e.studentId)

        for (const sub of subjects) {
            // Pick a teacher
            const teacher = teachers[teacherIdx]

            // Cycle teachers 4-10 (indices 3-9) -> 7 teachers
            teacherIdx++
            if (teacherIdx > 9) teacherIdx = 3

            // Create Subject (if we want the model) or just link via Course
            // Let's just create the Course directly as that's the main teaching unit

            await prisma.course.create({
                data: {
                    name: sub.name,
                    termId: termId,
                    classId: cls.id,
                    teacherId: teacher.id,
                    studentIds: studentIds
                }
            })
            courseCount++
        }
    }
    console.log(`✅ Created ${courseCount} Courses across ${classes.length} classes.`)

    console.log(`
🎉 POPULATION COMPLETE!
---------------------------------------------
Summary:
- Users: ${teachers.length} Teachers, ${students.length} Students
- Classes: ${classes.length} (30 students each)
- Courses: ${courseCount}
- Term: ${term.type}
---------------------------------------------
    `)
}

main()
    .catch((e) => {
        console.error("❌ Error during population:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
