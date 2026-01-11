
import { PrismaClient, Role, SemesterType, AcademicDomain, AttendanceStatus, AssignmentType } from "@prisma/client"
import bcrypt from "bcryptjs"
import { faker } from "@faker-js/faker"

const prisma = new PrismaClient()

// Seed Configuration
const CONFIG = {
    TEACHER_COUNT: 15,
    STUDENT_COUNT: 120,
    CLASS_COUNT: 6, // e.g. 10-A, 10-B, 11-A, ...
    SUBJECT_COUNT: 10,
    ACADEMIC_YEAR: "2024/2025",
}

async function main() {
    console.log("🌱 STARTING ORGANIC DATABASE POPULATION...")

    // ----------------------------------------------------------------------
    // 1. ACADEMIC YEAR & TERM
    // ----------------------------------------------------------------------
    console.log("📅 1. Setting up Academic Year & Term...")
    let academicYear = await prisma.academicYear.findFirst({ where: { name: CONFIG.ACADEMIC_YEAR } })
    if (!academicYear) {
        academicYear = await prisma.academicYear.create({
            data: {
                name: CONFIG.ACADEMIC_YEAR,
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
    console.log(`   -> Term: ${term.type} (${term.id})`)

    // ----------------------------------------------------------------------
    // 2. SUBJECTS
    // ----------------------------------------------------------------------
    console.log("📚 2. Creating Subjects...")
    const predefinedSubjects = [
        { name: "Mathematics", code: "MAT", domains: [AcademicDomain.SCIENCE_TECHNOLOGY] },
        { name: "Physics", code: "PHY", domains: [AcademicDomain.SCIENCE_TECHNOLOGY] },
        { name: "Chemistry", code: "CHE", domains: [AcademicDomain.SCIENCE_TECHNOLOGY] },
        { name: "Biology", code: "BIO", domains: [AcademicDomain.SCIENCE_TECHNOLOGY] },
        { name: "English Literature", code: "ENG", domains: [AcademicDomain.LANGUAGE_COMMUNICATION] },
        { name: "World History", code: "HIS", domains: [AcademicDomain.SOCIAL_HUMANITIES] },
        { name: "Geography", code: "GEO", domains: [AcademicDomain.SOCIAL_HUMANITIES] },
        { name: "Art & Design", code: "ART", domains: [AcademicDomain.ARTS_CREATIVITY] },
        { name: "Physical Education", code: "PE", domains: [AcademicDomain.PHYSICAL_EDUCATION] },
        { name: "Computer Science", code: "CS", domains: [AcademicDomain.SCIENCE_TECHNOLOGY, AcademicDomain.ARTS_CREATIVITY] },
    ]

    const dbSubjects = []
    for (const sub of predefinedSubjects) {
        // Upsert subjects
        const s = await prisma.subject.upsert({
            where: { id: "placeholder_id_matcher" }, // We can't easily upsert by non-unique, so we find first
            update: {},
            create: {
                name: sub.name,
                code: sub.code,
                description: faker.lorem.sentence(),
                academicDomains: sub.domains
            }
        }).catch(async () => {
            // Fallback if upsert fails or logic is complex (simply create if not exists)
            const existing = await prisma.subject.findFirst({ where: { code: sub.code } })
            if (existing) return existing
            return prisma.subject.create({
                data: {
                    name: sub.name,
                    code: sub.code,
                    description: faker.lorem.sentence(),
                    academicDomains: sub.domains
                }
            })
        })
        dbSubjects.push(s)
    }
    console.log(`   -> ${dbSubjects.length} Subjects ready.`)

    // ----------------------------------------------------------------------
    // 3. USERS (Teachers & Students)
    // ----------------------------------------------------------------------
    console.log("👥 3. Creating Users (Teachers & Students)...")
    const commonPassword = await bcrypt.hash("password123", 10)

    // -- Teachers
    const teachers = []
    for (let i = 0; i < CONFIG.TEACHER_COUNT; i++) {
        const sex = faker.person.sexType()
        const firstName = faker.person.firstName(sex)
        const lastName = faker.person.lastName()
        const email = faker.internet.email({ firstName, lastName, provider: 'school.edu' })

        const teacher = await prisma.user.create({
            data: {
                name: `${firstName} ${lastName}`,
                email: email.toLowerCase(),
                password: commonPassword,
                roles: [Role.SUBJECT_TEACHER],
                image: faker.image.avatar(),
                isActive: true,
                creationSource: "seed"
            }
        })
        teachers.push(teacher)
    }
    console.log(`   -> ${teachers.length} Teachers created.`)

    // -- Students
    const students = []
    for (let i = 0; i < CONFIG.STUDENT_COUNT; i++) {
        const sex = faker.person.sexType()
        const firstName = faker.person.firstName(sex)
        const lastName = faker.person.lastName()
        const email = faker.internet.email({ firstName, lastName, provider: 'student.school.edu' })

        const student = await prisma.user.create({
            data: {
                name: `${firstName} ${lastName}`,
                email: email.toLowerCase(),
                password: commonPassword, // all students have same password for ease
                roles: [Role.STUDENT],
                image: faker.image.avatar(),
                isActive: true,
                officialId: faker.string.numeric(8), // Random Student ID
                creationSource: "seed"
            }
        })
        students.push(student)
    }
    console.log(`   -> ${students.length} Students created.`)

    // ----------------------------------------------------------------------
    // 4. CLASSES & ENROLLMENTS
    // ----------------------------------------------------------------------
    console.log("🏫 4. Creating Classes & Enrollments...")
    const classLevels = ["10", "11", "12"]
    const classSections = ["A", "B", "C"]
    const classes = []

    // Create ~6 classes randomly or structured
    let studentIdx = 0
    let classCounter = 0

    for (const level of classLevels) {
        for (const section of classSections) {
            if (classCounter >= CONFIG.CLASS_COUNT) break

            const className = `${level}-${section}`
            // Pick a random teacher as Homeroom
            const homeroomTeacher = teachers[classCounter % teachers.length] // distribute evenly

            // Assign Homeroom Role
            await prisma.user.update({
                where: { id: homeroomTeacher.id },
                data: { roles: { push: Role.HOMEROOM_TEACHER } } // This might duplicate if already exists, but roles is array. 
                // Better approach with Prisma array helpers? Prisma doesn't dedupe automatically on push.
                // For seed, we can just set it.
            }).catch(() => { }) // Ignore if error or duplicate logic needed

            // Let's just create class
            const cls = await prisma.class.create({
                data: {
                    name: className,
                    termId: term.id,
                    homeroomTeacherId: homeroomTeacher.id
                }
            })
            classes.push(cls)
            classCounter++

            // Enrol ~20-30 students
            const studentsForClass = students.slice(studentIdx, studentIdx + 20)
            studentIdx += 20

            if (studentsForClass.length > 0) {
                const enrollmentData = studentsForClass.map(s => ({
                    studentId: s.id,
                    classId: cls.id
                }))
                await prisma.enrollment.createMany({ data: enrollmentData })

                // Update student record enrolledCourseIds is for Courses, not Classes directly in User model usually?
                // Wait, User model has `enrolledCourseIds` but `enrollments` links to Class.
                // The schema says Enrollment connects Student <-> Class.
                // The `enrolledCourses` relation on User is for Course model.
            }
        }
    }
    console.log(`   -> ${classes.length} Classes created with enrollments.`)

    // ----------------------------------------------------------------------
    // 5. COURSES
    // ----------------------------------------------------------------------
    console.log("📖 5. Creating Courses & Assigning Content...")
    const courses = []

    // For each class, create a course for each subject
    for (const cls of classes) {
        // Get students in this class
        const classEnrollments = await prisma.enrollment.findMany({ where: { classId: cls.id } })
        const classStudentIds = classEnrollments.map(e => e.studentId)

        for (const subject of dbSubjects) {
            // Pick a random teacher (or specific subject teacher)
            const teacher = faker.helpers.arrayElement(teachers)

            const course = await prisma.course.create({
                data: {
                    name: subject.name,
                    reportName: subject.name,
                    subjectId: subject.id,
                    classId: cls.id,
                    termId: term.id,
                    teacherId: teacher.id,
                    studentIds: classStudentIds // Enrol all class students to the course
                }
            })
            courses.push(course)

            // --- A. MATERIALS ---
            const materialCount = faker.number.int({ min: 2, max: 5 })
            for (let m = 0; m < materialCount; m++) {
                const material = await prisma.material.create({
                    data: {
                        title: `${faker.word.adjective()} ${subject.name} ${faker.word.noun()}`,
                        description: faker.lorem.paragraph(),
                        fileUrl: faker.internet.url(), // Placeholder
                        teacherId: teacher.id,
                    }
                })

                // Assign to course
                await prisma.materialAssignment.create({
                    data: {
                        materialId: material.id,
                        courseId: course.id
                    }
                })
            }

            // --- B. QUIZZES & ASSIGNMENTS ---
            // Create 1 Quiz
            const quiz = await prisma.quiz.create({
                data: {
                    title: `Unit Test: ${faker.lorem.words(2)}`,
                    description: "Please complete this quiz to assess your understanding.",
                    teacherId: teacher.id,
                    questions: {
                        create: Array.from({ length: 5 }).map((_, idx) => ({
                            text: faker.lorem.sentence() + "?",
                            order: idx,
                            choices: {
                                create: [
                                    { text: faker.lorem.word(), isCorrect: true, order: 0 },
                                    { text: faker.lorem.word(), isCorrect: false, order: 1 },
                                    { text: faker.lorem.word(), isCorrect: false, order: 2 },
                                    { text: faker.lorem.word(), isCorrect: false, order: 3 },
                                ]
                            }
                        }))
                    }
                }
            })

            // Assign Quiz to Course
            const quizAssignment = await prisma.assignment.create({
                data: {
                    title: quiz.title,
                    description: "Online Quiz",
                    dueDate: faker.date.future(),
                    type: AssignmentType.QUIZ,
                    courseId: course.id,
                    quizId: quiz.id,
                    maxPoints: 100,
                    academicDomains: subject.academicDomains
                }
            })

            // Create Regular Submission Assignment
            const hwAssignment = await prisma.assignment.create({
                data: {
                    title: `Homework: ${faker.lorem.words(3)}`,
                    description: faker.lorem.paragraph(),
                    dueDate: faker.date.recent({ days: 10 }), // Past due potentially
                    type: AssignmentType.SUBMISSION,
                    courseId: course.id,
                    maxPoints: 100,
                    academicDomains: subject.academicDomains
                }
            })

            // --- C. SUBMISSIONS ---
            // Have some students submit the homework
            for (const studentId of classStudentIds) {
                // 80% chance to submit
                if (faker.datatype.boolean({ probability: 0.8 })) {
                    const grade = faker.number.int({ min: 60, max: 100 })
                    await prisma.submission.create({
                        data: {
                            assignmentId: hwAssignment.id,
                            studentId: studentId,
                            grade: grade,
                            feedback: grade < 75 ? "Please review the material." : "Great job!",
                            submittedAt: faker.date.recent({ days: 5 }),
                            link: faker.internet.url()
                        }
                    })
                }
            }

            // --- D. ATTENDANCE ---
            // Create attendance for a few days
            const attendanceDates = [
                faker.date.recent({ days: 1 }),
                faker.date.recent({ days: 3 }),
                faker.date.recent({ days: 5 })
            ]

            for (const date of attendanceDates) {
                for (const studentId of classStudentIds) {
                    // 90% Present, 5% Absent, 5% Late/Excused
                    const statusRoll = faker.number.int({ min: 1, max: 100 })
                    let status: AttendanceStatus = AttendanceStatus.PRESENT
                    if (statusRoll > 95) status = AttendanceStatus.ABSENT
                    else if (statusRoll > 90) status = AttendanceStatus.EXCUSED

                    await prisma.attendance.create({
                        data: {
                            date: date,
                            status: status,
                            courseId: course.id,
                            studentId: studentId,
                            period: 1 // Simplified
                        }
                    })
                }
            }

            // --- E. SCHEDULE ---
            // Add a couple of schedule slots
            await prisma.schedule.create({
                data: {
                    dayOfWeek: faker.number.int({ min: 1, max: 5 }),
                    period: faker.number.int({ min: 1, max: 6 }),
                    courseId: course.id
                }
            })
        }
    }
    console.log(`   -> ${courses.length} Courses populated with Materials, Assignments, Submissions & Attendance.`)

    console.log(`
🎉 ORGANIC POPULATION COMPLETE!
---------------------------------------------
Summary:
- Teachers: ${teachers.length}
- Students: ${students.length}
- Classes: ${classes.length}
- Courses: ${courses.length}
- Data generated includes:
  - Users with organic names/avatars
  - Materials & Assignments
  - Student Submissions & Grades
  - Attendance Records
  - Quizzes with questions
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
