
import { PrismaClient, Role, SemesterType, AcademicDomain, AttendanceStatus, AssignmentType } from "@prisma/client"
import * as bcrypt from "bcryptjs"
import { faker } from "@faker-js/faker"

const prisma = new PrismaClient()

// Seed Configuration
const CONFIG = {
    TEACHER_COUNT: 15,
    STUDENT_COUNT_PER_GRADE: 40, // 40 per grade * 3 grades = 120 total approx
    CLASS_SECTIONS: ["A", "B"], // 2 classes per grade

    // Terms configuration based on user request
    TERMS: [
        {
            name: "2024/2025 Even",
            startDate: new Date("2025-01-01"),
            endDate: new Date("2025-06-30"),
            type: SemesterType.EVEN,
            academicYear: "2024/2025",
            isActive: false
        },
        {
            name: "2025/2026 Odd",
            startDate: new Date("2025-07-01"),
            endDate: new Date("2025-12-31"),
            type: SemesterType.ODD,
            academicYear: "2025/2026",
            isActive: false
        },
        {
            name: "2025/2026 Even", // Current active
            startDate: new Date("2026-01-01"),
            endDate: new Date("2026-07-30"),
            type: SemesterType.EVEN,
            academicYear: "2025/2026",
            isActive: true
        }
    ]
}

async function main() {
    console.log("🌱 STARTING ORGANIC DATABASE POPULATION (3 SEMESTERS)...")

    // ----------------------------------------------------------------------
    // 0. CLEANUP (Optional, mostly handled by reset-db, but good for safety if needed)
    // ----------------------------------------------------------------------

    // ----------------------------------------------------------------------
    // 1. ACADEMIC YEARS & TERMS
    // ----------------------------------------------------------------------
    console.log("📅 1. Setting up Academic Years & Terms...")
    const termMap = new Map() // Key: index, Value: Term Object

    for (let i = 0; i < CONFIG.TERMS.length; i++) {
        const tConfig = CONFIG.TERMS[i]

        // Ensure Academic Year exists
        let academicYear = await prisma.academicYear.findFirst({ where: { name: tConfig.academicYear } })
        if (!academicYear) {
            academicYear = await prisma.academicYear.create({
                data: {
                    name: tConfig.academicYear,
                    startDate: tConfig.startDate, // Simplified, using term dates for year bounds roughly
                    endDate: tConfig.endDate,
                    isActive: tConfig.isActive // Will be overridden by term logic if strictly one active
                }
            })
        }

        let term = await prisma.term.findFirst({
            where: { academicYearId: academicYear.id, type: tConfig.type }
        })

        if (!term) {
            term = await prisma.term.create({
                data: {
                    type: tConfig.type,
                    startDate: tConfig.startDate,
                    endDate: tConfig.endDate,
                    isActive: tConfig.isActive,
                    academicYearId: academicYear.id
                }
            })
        }
        termMap.set(i, term)
        console.log(`   -> Created/Found Term: ${tConfig.name} (${term.id})`)
    }

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
        { name: "Computer Science", code: "CS", domains: [AcademicDomain.SCIENCE_TECHNOLOGY] },
    ]

    const dbSubjects = []
    for (const sub of predefinedSubjects) {
        const s = await prisma.subject.upsert({
            where: { id: "placeholder" }, // upsert hack not effective if id unknown, so findFirst
            update: {},
            create: {
                name: sub.name,
                code: sub.code,
                description: faker.lorem.sentence(),
                academicDomains: sub.domains
            }
        }).catch(async () => {
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

    // ----------------------------------------------------------------------
    // 3. USERS (Teachers & Students)
    // ----------------------------------------------------------------------
    console.log("👥 3. Creating Users...")
    const commonPassword = await bcrypt.hash("password123", 10)

    // -- Teachers
    const teachers = []
    for (let i = 0; i < CONFIG.TEACHER_COUNT; i++) {
        const firstName = faker.person.firstName()
        const lastName = faker.person.lastName()
        const email = faker.internet.email({ firstName, lastName, provider: 'school.edu' })

        const teacher = await prisma.user.create({
            data: {
                name: `${firstName} ${lastName}`,
                email: email.toLowerCase(),
                password: commonPassword,
                roles: [Role.SUBJECT_TEACHER],
                image: faker.image.avatar(),
                isActive: true
            }
        })
        teachers.push(teacher)
    }

    // -- Students (Cohorts)
    // To simulate 3 semesters (2 years):
    // Cohort 2025 (Grade 12 -> Graduated -> Gone) - Skipping to simplify
    // Cohort 2026 (Grade 11 -> 12 -> 12)
    // Cohort 2027 (Grade 10 -> 11 -> 11)
    // Cohort 2028 (New -> 10 -> 10)

    // Simplified Logic: 
    // We create Student Groups.
    // Group A: Starts in Grade 10 (Term 1), Promoted 11 (Term 2, 3)
    // Group B: Starts in Grade 11 (Term 1), Promoted 12 (Term 2, 3)
    // Group C: Starts in Grade 12 (Term 1), Graduated (Not in Term 2, 3)
    // Group D: New entrants in Term 2 (Grade 10) (Term 2, 3)

    const createStudents = async (count: number) => {
        const arr = []
        for (let i = 0; i < count; i++) {
            const firstName = faker.person.firstName()
            const lastName = faker.person.lastName()
            const email = faker.internet.email({ firstName, lastName, provider: 'student.school.edu' })
            const s = await prisma.user.create({
                data: {
                    name: `${firstName} ${lastName}`,
                    email: email.toLowerCase(),
                    password: commonPassword,
                    roles: [Role.STUDENT],
                    image: faker.image.avatar(),
                    officialId: faker.string.numeric(8),
                    isActive: true
                }
            })
            arr.push(s)
        }
        return arr
    }

    console.log("   -> Creating Student Cohorts...")
    const cohortA = await createStudents(CONFIG.STUDENT_COUNT_PER_GRADE) // Current Grade 11 (approx)
    const cohortB = await createStudents(CONFIG.STUDENT_COUNT_PER_GRADE) // Current Grade 12 (approx)
    const cohortC = await createStudents(CONFIG.STUDENT_COUNT_PER_GRADE) // Graduated
    const cohortD = await createStudents(CONFIG.STUDENT_COUNT_PER_GRADE) // Current Grade 10 (Incoming)

    // ----------------------------------------------------------------------
    // 4. MAIN LOOP - SIMULATE TERMS
    // ----------------------------------------------------------------------
    console.log("🏫 4. Simulating Terms, Classes, and Academic Data...")

    /*
      Term 1: Jan 25 - Jun 25
         - Grade 10: Cohort A
         - Grade 11: Cohort B
         - Grade 12: Cohort C
      Term 2: Jul 25 - Dec 25
         - Grade 10: Cohort D
         - Grade 11: Cohort A
         - Grade 12: Cohort B
         - (Cohort C graduated)
      Term 3: Jan 26 - Jul 26
         - Grade 10: Cohort D
         - Grade 11: Cohort A
         - Grade 12: Cohort B
    */

    // Mapping of [TermIndex][GradeLevel] -> StudentArray
    const termEnrollmentPlan = {
        0: { // Term 1
            "10": cohortA,
            "11": cohortB,
            "12": cohortC
        },
        1: { // Term 2
            "10": cohortD,
            "11": cohortA,
            "12": cohortB
        },
        2: { // Term 3
            "10": cohortD,
            "11": cohortA,
            "12": cohortB
        }
    }

    for (let tIndex = 0; tIndex < CONFIG.TERMS.length; tIndex++) {
        const currentTerm = termMap.get(tIndex)
        const enrollmentMap = termEnrollmentPlan[tIndex as keyof typeof termEnrollmentPlan]

        console.log(`\n   --- Processing ${currentTerm.id} (${CONFIG.TERMS[tIndex].name}) ---`)

        // For each grade level in this term
        for (const [gradeLevel, students] of Object.entries(enrollmentMap)) {
            // Split students into sections (A, B)
            const half = Math.ceil(students.length / 2)
            const sectionAStudents = students.slice(0, half)
            const sectionBStudents = students.slice(half)
            const sections = [
                { name: "A", students: sectionAStudents },
                { name: "B", students: sectionBStudents }
            ]

            for (const section of sections) {
                if (section.students.length === 0) continue

                // 1. Create Class
                const className = `${gradeLevel}-${section.name}`
                const homeroomTeacher = teachers[faker.number.int({ min: 0, max: teachers.length - 1 })]

                // Ensure Homeroom Role
                if (!homeroomTeacher.roles.includes(Role.HOMEROOM_TEACHER)) {
                    homeroomTeacher.roles.push(Role.HOMEROOM_TEACHER)
                    await prisma.user.update({
                        where: { id: homeroomTeacher.id },
                        data: { roles: homeroomTeacher.roles }
                    })
                }

                const cls = await prisma.class.create({
                    data: {
                        name: className,
                        termId: currentTerm.id,
                        homeroomTeacherId: homeroomTeacher.id
                    }
                })

                // 2. Enroll Students
                const enrollmentData = section.students.map(s => ({
                    studentId: s.id,
                    classId: cls.id
                }))
                await prisma.enrollment.createMany({ data: enrollmentData })

                // 3. Create Courses for this Class (All Subjects)
                for (const subject of dbSubjects) {
                    const teacher = teachers[faker.number.int({ min: 0, max: teachers.length - 1 })]

                    const course = await prisma.course.create({
                        data: {
                            name: `${subject.name} ${className}`,
                            reportName: subject.name,
                            subjectId: subject.id,
                            classId: cls.id,
                            termId: currentTerm.id,
                            teacherId: teacher.id,
                            studentIds: section.students.map(s => s.id)
                        }
                    })

                    // --- MATERIALS (LINKS ONLY) ---
                    // Create 3-5 Materials per course
                    const materialCount = faker.number.int({ min: 3, max: 5 })
                    for (let m = 0; m < materialCount; m++) {
                        const material = await prisma.material.create({
                            data: {
                                title: `${subject.name} Resource ${m + 1}`,
                                description: faker.lorem.sentence(),
                                linkUrl: faker.internet.url(),
                                materialType: "LINK",
                                teacherId: teacher.id,
                                // Optional: link to course directly if needed by schema, but schema has MaterialAssignment
                            }
                        })

                        // Link to Course via MaterialAssignment
                        await prisma.materialAssignment.create({
                            data: {
                                materialId: material.id,
                                courseId: course.id
                            }
                        })
                    }

                    // --- ASSIGNMENTS & GRADING ---

                    // A. Standard Assignments
                    // Create 3-5 Assignments
                    const assignCount = 4
                    for (let a = 0; a < assignCount; a++) {
                        const maxPoints = 100
                        const assignment = await prisma.assignment.create({
                            data: {
                                title: `${subject.code} ${a === 0 ? 'Project' : 'Homework'} ${a + 1}`,
                                description: faker.lorem.sentence(),
                                dueDate: faker.date.between({ from: CONFIG.TERMS[tIndex].startDate, to: CONFIG.TERMS[tIndex].endDate }),
                                type: AssignmentType.SUBMISSION,
                                courseId: course.id,
                                maxPoints: maxPoints,
                                academicDomains: subject.academicDomains
                            }
                        })

                        // Submissions (100% submission rate)
                        for (const student of section.students) {
                            // Grade logic: 60 - 100
                            const grade = faker.number.int({ min: 60, max: 100 })

                            await prisma.submission.create({
                                data: {
                                    assignmentId: assignment.id,
                                    studentId: student.id,
                                    grade: grade,
                                    feedback: grade < 75 ? "Good effort, keep improving." : "Excellent work!",
                                    submittedAt: faker.date.between({ from: assignment.dueDate, to: new Date(assignment.dueDate.getTime() + 86400000) }),
                                    link: "https://docs.google.com/document/d/..."
                                }
                            })
                        }
                    }

                    // B. Quiz (REMOVED per user request)

                    // C. Participation / Attendance Assignment (Special 10 Points)
                    const partAssign = await prisma.assignment.create({
                        data: {
                            title: "Class Participation & Attendance",
                            description: "Overall participation score for the term.",
                            dueDate: CONFIG.TERMS[tIndex].endDate,
                            type: AssignmentType.NON_SUBMISSION, // Or submission if manual entry
                            courseId: course.id,
                            maxPoints: 10,
                            academicDomains: subject.academicDomains
                        }
                    })

                    // Participation Grades
                    for (const student of section.students) {
                        // Grade: 6 - 10
                        const grade = faker.number.int({ min: 6, max: 10 })
                        await prisma.submission.create({
                            data: {
                                assignmentId: partAssign.id,
                                studentId: student.id,
                                grade: grade,
                                submittedAt: CONFIG.TERMS[tIndex].endDate
                            }
                        })
                    }

                    // D. Daily Attendance Records (For organic feel)
                    // Generate ~20 records per student per course
                    const attendDates = []
                    for (let d = 0; d < 15; d++) {
                        attendDates.push(
                            faker.date.between({ from: CONFIG.TERMS[tIndex].startDate, to: CONFIG.TERMS[tIndex].endDate })
                        )
                    }

                    for (const date of attendDates) {
                        for (const student of section.students) {
                            const roll = faker.number.int({ min: 1, max: 100 })
                            let status: AttendanceStatus = AttendanceStatus.PRESENT
                            if (roll > 95) status = AttendanceStatus.ABSENT // Very few absent
                            else if (roll > 90) status = AttendanceStatus.EXCUSED

                            await prisma.attendance.create({
                                data: {
                                    date: date,
                                    status: status,
                                    courseId: course.id,
                                    studentId: student.id,
                                    period: 1
                                }
                            })
                        }
                    }


                    // E. SCHEDULE
                    // Create simple schedule: 1-2 periods per week per course
                    // Simple random allocation (conflicts possible but unlikely to block seed)
                    const scheduleCount = faker.number.int({ min: 1, max: 2 })
                    for (let s = 0; s < scheduleCount; s++) {
                        await prisma.schedule.create({
                            data: {
                                dayOfWeek: faker.number.int({ min: 1, max: 5 }), // Mon-Fri
                                period: faker.number.int({ min: 1, max: 6 }),    // 1-6 periods
                                courseId: course.id
                            }
                        })
                    }

                } // End Courses
            } // End Sections
        } // End Grades
    } // End Terms

    console.log(`
🎉 ORGANIC POPULATION COMPLETE!
---------------------------------------------
- 3 Terms Configured
- Students promoted across terms
- All assignments 100% submitted
- Scores 60-100% range
- Participation assignments (10pts) created
---------------------------------------------
    `)
}

main()
    .catch((e) => {
        console.error("❌ Error:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
