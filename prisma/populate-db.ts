import {
    AcademicDomain,
    AssignmentType,
    AttendanceStatus,
    ClassColor,
    ClassEnrollmentSource,
    CourseEnrollmentMode,
    CourseEnrollmentSource,
    GradeLevel,
    PrismaClient,
    Role,
    SemesterType,
} from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const DEMO_PASSWORD = "demo123"
const ACADEMIC_YEAR_NAME = "2025/2026"

const subjects = [
    {
        name: "Pendidikan Agama dan Budi Pekerti",
        code: "PAB",
        domain: AcademicDomain.SPIRITUALITY_ETHICS,
        teacher: "Ahmad Fauzan",
    },
    {
        name: "Pendidikan Pancasila",
        code: "PPK",
        domain: AcademicDomain.SOCIAL_HUMANITIES,
        teacher: "Siti Rahmawati",
    },
    {
        name: "Bahasa Indonesia",
        code: "BIN",
        domain: AcademicDomain.LANGUAGE_COMMUNICATION,
        teacher: "Dewi Lestari",
    },
    {
        name: "Matematika",
        code: "MAT",
        domain: AcademicDomain.SCIENCE_TECHNOLOGY,
        teacher: "Budi Santoso",
    },
    {
        name: "Bahasa Inggris",
        code: "BIG",
        domain: AcademicDomain.LANGUAGE_COMMUNICATION,
        teacher: "Rina Wulandari",
    },
    {
        name: "Sejarah Indonesia",
        code: "SEJ",
        domain: AcademicDomain.SOCIAL_HUMANITIES,
        teacher: "Hendra Saputra",
    },
    {
        name: "Pendidikan Jasmani, Olahraga, dan Kesehatan",
        code: "PJK",
        domain: AcademicDomain.PHYSICAL_EDUCATION,
        teacher: "Agus Prasetyo",
    },
    {
        name: "Seni Budaya",
        code: "SBD",
        domain: AcademicDomain.ARTS_CREATIVITY,
        teacher: "Maya Kartika",
    },
] as const

const classes = [
    {
        name: "Kelas 10 SMA",
        gradeLevel: GradeLevel.GRADE_10,
        color: ClassColor.BLUE,
        students: [
            "Aditya Pratama",
            "Alya Putri Ramadhani",
            "Bagas Maulana",
            "Citra Maharani",
            "Dimas Arya Nugraha",
            "Fajar Rizky",
        ],
    },
    {
        name: "Kelas 11 SMA",
        gradeLevel: GradeLevel.GRADE_11,
        color: ClassColor.EMERALD,
        students: [
            "Gita Savitri",
            "Hanif Akbar",
            "Intan Permata Sari",
            "Joko Firmansyah",
            "Keyla Anindita",
            "Luthfi Ramadhan",
        ],
    },
    {
        name: "Kelas 12 SMA",
        gradeLevel: GradeLevel.GRADE_12,
        color: ClassColor.VIOLET,
        students: [
            "Nadine Azzahra",
            "Putra Mahendra",
            "Qonita Zahra",
            "Raka Adiwijaya",
            "Salma Nabila",
            "Yoga Pranata",
        ],
    },
] as const

const assignmentTemplates = [
    { title: "Asesmen Formatif", dueDate: new Date("2026-02-20T07:00:00+07:00") },
    { title: "Proyek Semester", dueDate: new Date("2026-04-24T07:00:00+07:00") },
    { title: "Sumatif Akhir Semester", dueDate: new Date("2026-06-05T07:00:00+07:00") },
] as const

const attendanceDates = [
    "2026-02-02",
    "2026-02-16",
    "2026-03-02",
    "2026-03-16",
    "2026-04-06",
    "2026-04-20",
    "2026-05-04",
    "2026-05-18",
    "2026-06-01",
    "2026-06-08",
    "2026-06-15",
    "2026-06-22",
].map((date) => new Date(`${date}T07:00:00+07:00`))

function slugify(value: string) {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, ".")
        .replace(/^\.|\.$/g, "")
}

function scoreFor(studentIndex: number, subjectIndex: number, assignmentIndex: number) {
    return 78 + ((studentIndex * 3 + subjectIndex * 2 + assignmentIndex * 4) % 19)
}

function attendanceFor(studentIndex: number, dateIndex: number) {
    if (dateIndex === (studentIndex + 2) % attendanceDates.length) {
        return { status: AttendanceStatus.EXCUSED, excuseReason: "Sakit" }
    }

    if (dateIndex === (studentIndex + 5) % attendanceDates.length) {
        return { status: AttendanceStatus.EXCUSED, excuseReason: "Izin keperluan keluarga" }
    }

    if (studentIndex % 4 === 0 && dateIndex === (studentIndex + 8) % attendanceDates.length) {
        return { status: AttendanceStatus.ABSENT, excuseReason: null }
    }

    return { status: AttendanceStatus.PRESENT, excuseReason: null }
}

async function clearDatabase() {
    console.log("Cleaning existing application data...")

    // Dependants first keeps this compatible if relation enforcement changes later.
    await prisma.courseChatMessage.deleteMany()
    await prisma.courseAnnouncement.deleteMany()
    await prisma.courseNavigationState.deleteMany()
    await prisma.userWorkspacePreference.deleteMany()
    await prisma.academicRolloverItem.deleteMany()
    await prisma.academicRollover.deleteMany()
    await prisma.managementAuditLog.deleteMany()
    await prisma.reportCard.deleteMany()
    await prisma.attendance.deleteMany()
    await prisma.submission.deleteMany()
    await prisma.materialAssignment.deleteMany()
    await prisma.schedule.deleteMany()
    await prisma.courseEnrollment.deleteMany()
    await prisma.enrollment.deleteMany()
    await prisma.assignment.deleteMany()
    await prisma.quizChoice.deleteMany()
    await prisma.quizQuestion.deleteMany()
    await prisma.quiz.deleteMany()
    await prisma.quizFolder.deleteMany()
    await prisma.material.deleteMany()
    await prisma.materialFolder.deleteMany()
    await prisma.course.deleteMany()
    await prisma.subject.deleteMany()
    await prisma.message.deleteMany()
    await prisma.conversation.deleteMany()
    await prisma.class.deleteMany()
    await prisma.term.deleteMany()
    await prisma.academicYear.deleteMany()
    await prisma.systemConfig.deleteMany()
    await prisma.user.deleteMany()
}

async function main() {
    console.log("Starting deterministic SMA report-card demo seed...")
    await clearDatabase()

    const password = await bcrypt.hash(DEMO_PASSWORD, 10)

    const admin = await prisma.user.create({
        data: {
            name: "Admin JALMS",
            email: "admin@jalms.id",
            password,
            roles: [Role.ADMIN],
            isActive: true,
            conversationIds: [],
            enrolledCourseIds: [],
        },
    })

    const homeroomTeacher = await prisma.user.create({
        data: {
            name: "Nur Aisyah",
            email: "wali.kelas@jalms.id",
            password,
            roles: [Role.HOMEROOM_TEACHER],
            nip: "198706152012122001",
            isActive: true,
            avatarConfig: { style: "notionists", seed: "nur-aisyah" },
            conversationIds: [],
            enrolledCourseIds: [],
        },
    })

    const subjectTeachers = []
    for (const [index, subject] of subjects.entries()) {
        const teacher = await prisma.user.create({
            data: {
                name: subject.teacher,
                email: `${slugify(subject.teacher)}@jalms.id`,
                password,
                roles: [Role.SUBJECT_TEACHER],
                nip: `198${String(index + 1).padStart(2, "0")}011201501${String(index + 1).padStart(3, "0")}`,
                isActive: true,
                avatarConfig: { style: "notionists", seed: slugify(subject.teacher) },
                conversationIds: [],
                enrolledCourseIds: [],
            },
        })
        subjectTeachers.push(teacher)
    }

    const academicYear = await prisma.academicYear.create({
        data: {
            name: ACADEMIC_YEAR_NAME,
            startDate: new Date("2025-07-14T00:00:00+07:00"),
            endDate: new Date("2026-07-30T23:59:59+07:00"),
            isActive: true,
        },
    })

    await prisma.term.create({
        data: {
            type: SemesterType.ODD,
            startDate: new Date("2025-07-14T00:00:00+07:00"),
            endDate: new Date("2025-12-19T23:59:59+07:00"),
            academicYearId: academicYear.id,
            isActive: false,
        },
    })

    const activeTerm = await prisma.term.create({
        data: {
            type: SemesterType.EVEN,
            startDate: new Date("2026-01-05T00:00:00+07:00"),
            endDate: new Date("2026-07-30T23:59:59+07:00"),
            academicYearId: academicYear.id,
            isActive: true,
        },
    })

    const dbSubjects = []
    for (const subject of subjects) {
        dbSubjects.push(await prisma.subject.create({
            data: {
                name: subject.name,
                code: subject.code,
                reportName: subject.name,
                description: `Mata pelajaran wajib SMA: ${subject.name}.`,
                academicDomains: [subject.domain],
            },
        }))
    }

    await prisma.systemConfig.createMany({
        data: [
            {
                id: "grading_scale",
                value: [
                    { grade: "A", min: 90, max: 100 },
                    { grade: "B", min: 80, max: 89 },
                    { grade: "C", min: 70, max: 79 },
                    { grade: "D", min: 60, max: 69 },
                    { grade: "E", min: 0, max: 59 },
                ],
            },
            { id: "principal_name", value: { name: "Drs. Bambang Setiawan, M.Pd." } },
            {
                id: "school_info",
                value: {
                    name: "SMA Nusantara Jaya",
                    address: "Jl. Pendidikan No. 10, Tangerang Selatan",
                },
            },
        ],
    })

    let totalStudents = 0
    let totalCourses = 0
    let totalReports = 0

    for (const [classIndex, classSeed] of classes.entries()) {
        const classroom = await prisma.class.create({
            data: {
                name: classSeed.name,
                gradeLevel: classSeed.gradeLevel,
                color: classSeed.color,
                termId: activeTerm.id,
                homeroomTeacherId: homeroomTeacher.id,
            },
        })

        const students: Array<{ id: string; name: string }> = []
        for (const [studentIndex, name] of classSeed.students.entries()) {
            const sequence = classIndex * classSeed.students.length + studentIndex + 1
            const nis = `26${String(sequence).padStart(6, "0")}`
            const nisn = `006${String(sequence).padStart(7, "0")}`

            students.push(await prisma.user.create({
                data: {
                    name,
                    email: `${slugify(name)}@siswa.jalms.id`,
                    password,
                    roles: [Role.STUDENT],
                    nis,
                    nisn,
                    officialId: nis,
                    isActive: true,
                    avatarConfig: { style: "adventurer", seed: slugify(name) },
                    conversationIds: [],
                    enrolledCourseIds: [],
                },
            }))
        }

        await prisma.enrollment.createMany({
            data: students.map((student) => ({
                studentId: student.id,
                classId: classroom.id,
                source: ClassEnrollmentSource.IMPORT,
                createdById: admin.id,
            })),
        })

        const courseIds: string[] = []

        for (const [subjectIndex, subject] of dbSubjects.entries()) {
            const course = await prisma.course.create({
                data: {
                    name: `${subject.name} - ${classSeed.name}`,
                    reportName: subject.name,
                    subjectId: subject.id,
                    classId: classroom.id,
                    termId: activeTerm.id,
                    teacherId: subjectTeachers[subjectIndex].id,
                    studentIds: students.map((student) => student.id),
                    attendancePoolScore: 10,
                    enrollmentMode: CourseEnrollmentMode.CLASS_SEEDED,
                    lastEnrollmentSyncAt: new Date(),
                    competencyRules: [
                        { grade: "A", min: 90, max: 100, description: `Menunjukkan penguasaan sangat baik pada ${subject.name}.` },
                        { grade: "B", min: 80, max: 89, description: `Menguasai sebagian besar kompetensi ${subject.name} dengan baik.` },
                        { grade: "C", min: 70, max: 79, description: `Menguasai kompetensi dasar ${subject.name} dan perlu meningkatkan ketelitian.` },
                        { grade: "D", min: 60, max: 69, description: `Perlu bimbingan lanjutan dalam memahami ${subject.name}.` },
                        { grade: "E", min: 0, max: 59, description: `Memerlukan pendampingan intensif pada ${subject.name}.` },
                    ],
                },
            })
            courseIds.push(course.id)
            totalCourses++

            await prisma.courseEnrollment.createMany({
                data: students.map((student) => ({
                    courseId: course.id,
                    studentId: student.id,
                    source: CourseEnrollmentSource.CLASS_SEED,
                    sourceClassId: classroom.id,
                    createdById: admin.id,
                })),
            })

            await prisma.schedule.create({
                data: {
                    dayOfWeek: (subjectIndex % 5) + 1,
                    period: Math.floor(subjectIndex / 5) + classIndex + 1,
                    courseId: course.id,
                },
            })

            for (const [assignmentIndex, template] of assignmentTemplates.entries()) {
                const assignment = await prisma.assignment.create({
                    data: {
                        title: `${template.title} ${subject.code}`,
                        description: `${template.title} untuk mata pelajaran ${subject.name}.`,
                        dueDate: template.dueDate,
                        type: AssignmentType.SUBMISSION,
                        maxPoints: 100,
                        latePenalty: 0,
                        academicDomains: subject.academicDomains,
                        courseId: course.id,
                        showGradeAfterSubmission: true,
                    },
                })

                await prisma.submission.createMany({
                    data: students.map((student, studentIndex) => ({
                        assignmentId: assignment.id,
                        studentId: student.id,
                        grade: scoreFor(studentIndex, subjectIndex, assignmentIndex),
                        feedback: "Capaian baik. Pertahankan konsistensi belajar dan tingkatkan ketelitian.",
                        submittedAt: new Date(template.dueDate.getTime() - 24 * 60 * 60 * 1000),
                    })),
                })
            }

            await prisma.attendance.createMany({
                data: attendanceDates.flatMap((date, dateIndex) =>
                    students.map((student, studentIndex) => {
                        const attendance = attendanceFor(studentIndex, dateIndex)
                        return {
                            date,
                            status: attendance.status,
                            excuseReason: attendance.excuseReason,
                            topic: `Pembelajaran ${subject.name}`,
                            period: 1,
                            courseId: course.id,
                            studentId: student.id,
                        }
                    }),
                ),
            })
        }

        for (const [studentIndex, student] of students.entries()) {
            await prisma.user.update({
                where: { id: student.id },
                data: { enrolledCourseIds: courseIds },
            })

            const hasAlpha = studentIndex % 4 === 0
            const extracurricular = ["Pramuka", "Palang Merah Remaja", "Paskibra"][studentIndex % 3]

            await prisma.reportCard.create({
                data: {
                    studentId: student.id,
                    classId: classroom.id,
                    termId: activeTerm.id,
                    courseGrades: [],
                    extracurriculars: [
                        {
                            activity: extracurricular,
                            predicate: studentIndex % 3 === 0 ? "A" : "B",
                            note: "Aktif, disiplin, dan mampu bekerja sama dalam kegiatan kelompok.",
                        },
                    ],
                    achievements: [
                        {
                            name: studentIndex % 2 === 0 ? "Lomba Literasi Sekolah" : "Proyek Kelas Inspiratif",
                            note: studentIndex % 2 === 0 ? "Meraih peringkat terbaik tingkat sekolah." : "Menunjukkan kreativitas dan kerja sama yang sangat baik.",
                        },
                    ],
                    development: [
                        {
                            activity: "Projek Penguatan Profil Pelajar Pancasila",
                            note: "Menunjukkan sikap gotong royong, mandiri, dan bernalar kritis.",
                        },
                    ],
                    attendance: { sick: 1, excused: 1, alpha: hasAlpha ? 1 : 0 },
                    homeroomTeacherNote: "Pertahankan semangat belajar, kedisiplinan, dan sikap positif. Terus kembangkan potensi akademik maupun nonakademik.",
                    principalName: "Drs. Bambang Setiawan, M.Pd.",
                    published: false,
                },
            })
            totalReports++
        }

        totalStudents += students.length
    }

    console.log(`
SMA report-card demo seed complete.
---------------------------------------------
Academic year : ${ACADEMIC_YEAR_NAME} (Even semester, active)
Classes       : ${classes.length} (grades 10, 11, and 12)
Subjects      : ${subjects.length} Indonesian compulsory subjects
Students      : ${totalStudents}
Courses       : ${totalCourses}
Draft reports : ${totalReports} (ready for Preview & Print)

Demo accounts (password: ${DEMO_PASSWORD})
Admin         : ${admin.email}
Homeroom      : ${homeroomTeacher.email}
---------------------------------------------
`)
}

main()
    .catch((error) => {
        console.error("Seed failed:", error)
        process.exitCode = 1
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
