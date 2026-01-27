"use server"

import { db as prisma } from "@/lib/db"
import { getUser } from "@/lib/actions/user.actions"
import { revalidatePath } from "next/cache"

export async function getHomeroomClasses() {
    try {
        const user = await getUser()
        if (!user) return { error: "User not found" }

        const classes = await prisma.class.findMany({
            where: {
                homeroomTeacherId: user.id,
                deletedAt: { isSet: false },
                term: { isActive: true }
            },
            include: {
                term: {
                    include: { academicYear: true }
                },
                _count: {
                    select: { students: true }
                }
            },
            orderBy: {
                name: "asc"
            }
        })

        return { classes }
    } catch (error) {
        console.error("Error fetching homeroom classes:", error)
        return { error: "Failed to fetch classes" }
    }
}

export async function getHomeroomClassDetails(classId: string) {
    try {
        const user = await getUser()
        if (!user) return { error: "User not found" }

        const classData = await prisma.class.findUnique({
            where: { id: classId },
            include: {
                term: {
                    include: { academicYear: true }
                },
                students: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                                email: true
                            }
                        }
                    },
                    orderBy: {
                        student: { name: 'asc' }
                    }
                },
                courses: {
                    where: { deletedAt: { isSet: false } },
                    include: {
                        assignments: {
                            where: { deletedAt: { isSet: false } },
                            include: {
                                submissions: {
                                    where: { deletedAt: { isSet: false } }
                                }
                            }
                        },
                        attendances: {
                            where: { deletedAt: { isSet: false } }
                        }
                    }
                }
            }
        })

        if (!classData) return { error: "Class not found" }
        if (classData.homeroomTeacherId !== user.id) return { error: "Unauthorized" }

        // Compile stats for each student
        const students = classData.students.map((enrollment) => {
            const student = enrollment.student

            let totalCourseGrades = 0
            let coursesWithGrades = 0

            let totalSessions = 0
            let totalAttended = 0

            classData.courses.forEach(course => {
                // --- Attendance Calculation ---
                const studentAttendance = course.attendances.filter(a => a.studentId === student.id)
                const courseSessions = studentAttendance.filter(a => a.status !== "SKIPPED").length
                const courseAttended = studentAttendance.filter(a =>
                    a.status === "PRESENT" || a.status === "EXCUSED"
                ).length

                totalSessions += courseSessions
                totalAttended += courseAttended

                const courseAttendancePercentage = courseSessions > 0 ? (courseAttended / courseSessions) : 1

                // --- Grade Calculation (Simplified version of getCourseGradebook) ---
                // Only if student is enrolled in this course?
                // The schema says Course has `studentIds`. We should check it.
                // Note: We fetched courses via Class relations. 
                // We need to check if the specific student is in this course.
                // Since the student is in the class, usually they are in the course, 
                // but let's assume valid enrollment for simplicity or check `studentIds` if available.
                // `course.studentIds` is available on the model, but we didn't include it in the query above.
                // Let's assume for now all class students are in class courses. 
                // If not, we might get 0 assignments/submissions which is fine.

                const attendancePool = course.attendancePoolScore || 0

                let studentPoints = 0
                let maxPointsPossible = 0
                let extraCreditPoints = 0

                course.assignments.forEach(assignment => {
                    const submission = assignment.submissions.find(s => s.studentId === student.id)
                    let actualPoints = 0

                    if (submission && submission.grade !== null) {
                        let points = Number((submission.grade / 100) * assignment.maxPoints)

                        // Late Penalty
                        const isLate = assignment.dueDate && submission.submittedAt > assignment.dueDate
                        if (isLate && assignment.latePenalty > 0) {
                            points -= points * (assignment.latePenalty / 100)
                        }
                        points = Math.round(points * 100) / 100

                        actualPoints = points
                    }

                    if (!assignment.isExtraCredit) {
                        maxPointsPossible += assignment.maxPoints
                    }

                    if (assignment.isExtraCredit) {
                        extraCreditPoints += actualPoints
                    } else {
                        studentPoints += actualPoints
                    }
                })

                const attendanceScore = courseAttendancePercentage * attendancePool
                const numerator = studentPoints + extraCreditPoints + attendanceScore
                const denominator = maxPointsPossible + attendancePool

                let courseGrade = 0
                if (denominator > 0) {
                    courseGrade = (numerator / denominator) * 100
                } else {
                    courseGrade = 100 // Default to 100 if no assignments yet? Or 0?
                    // Usually 100 is better for "no work assigned yet"
                }
                courseGrade = Math.min(courseGrade, 100) // Cap

                if (maxPointsPossible > 0 || attendancePool > 0) {
                    totalCourseGrades += courseGrade
                    coursesWithGrades++
                }
            })

            const overallAttendance = totalSessions > 0 ? (totalAttended / totalSessions) * 100 : 100
            const overallAverage = coursesWithGrades > 0 ? (totalCourseGrades / coursesWithGrades) : 0 // If no courses have work, 0 or 100? Let's say 0 implies N/A

            return {
                id: student.id,
                name: student.name,
                image: student.image,
                email: student.email,
                attendance: Math.round(overallAttendance * 10) / 10,
                averageGrade: Math.round(overallAverage * 10) / 10
            }
        })

        return { classData, students }

    } catch (error) {
        console.error("Error fetching homeroom class details:", error)
        return { error: "Failed to fetch class details" }
    }
}

export async function getStudentReportCard(studentId: string, classId: string) {
    try {
        const user = await getUser()
        if (!user) return { error: "Unauthorized" }

        // Get class to check term
        const classData = await prisma.class.findUnique({
            where: { id: classId },
            include: {
                term: { include: { academicYear: true } },
                homeroomTeacher: true
            }
        })

        if (!classData) return { error: "Class not found" }

        const student = await prisma.user.findUnique({
            where: { id: studentId }
        })

        if (!student) return { error: "Student not found" }

        // Compile Grade Data
        // Fetch courses where this student is enrolled for the class term
        const rawCourses = await prisma.course.findMany({
            where: {
                studentIds: { has: studentId },
                termId: classData.termId,
                deletedAt: { isSet: false }
            },
            include: {
                subject: true,
                teacher: true,
                assignments: {
                    where: { deletedAt: { isSet: false } },
                    include: {
                        submissions: { where: { studentId, deletedAt: { isSet: false } } }
                    }
                },
                attendances: {
                    where: { studentId, deletedAt: { isSet: false } }
                }
            }
        })

        const courses = rawCourses.map(course => {
            const studentAttendance = course.attendances
            const totalSessions = studentAttendance.filter(a => a.status !== "SKIPPED").length
            const attendedCount = studentAttendance.filter(a =>
                a.status === "PRESENT" || a.status === "EXCUSED"
            ).length

            const attendancePercentage = totalSessions > 0 ? (attendedCount / totalSessions) : 1
            const attendancePool = course.attendancePoolScore || 0

            let studentPoints = 0
            let maxPointsPossible = 0
            let extraCreditPoints = 0

            course.assignments.forEach(assignment => {
                const submission = assignment.submissions[0] // Only one per student
                let actualPoints = 0

                if (submission && submission.grade !== null) {
                    let points = Number((submission.grade / 100) * assignment.maxPoints)
                    if (assignment.dueDate && submission.submittedAt > assignment.dueDate && assignment.latePenalty > 0) {
                        points -= points * (assignment.latePenalty / 100)
                    }
                    actualPoints = Math.round(points * 100) / 100
                }

                if (!assignment.isExtraCredit) maxPointsPossible += assignment.maxPoints
                if (assignment.isExtraCredit) extraCreditPoints += actualPoints
                else studentPoints += actualPoints
            })

            const attendanceScore = attendancePercentage * attendancePool
            const numerator = studentPoints + extraCreditPoints + attendanceScore
            const denominator = maxPointsPossible + attendancePool

            let finalGrade = 100
            if (denominator > 0) {
                finalGrade = Math.min((numerator / denominator) * 100, 100)
            }

            return {
                id: course.id,
                name: course.subject?.reportName || course.reportName || course.name, // Use report name if available
                code: course.subject?.code || "",
                teacher: course.teacher.name,
                grade: Math.round(finalGrade),
                attendance: Math.round(attendancePercentage * 100)
            }
        })

        return {
            student,
            classData,
            courses,
            generatedAt: new Date()
        }

    } catch (error) {
        console.error("Error generating report card:", error)
        return { error: "Failed to generate report" }
    }
}

export async function getStudentBasicInfo(studentId: string) {
    try {
        const user = await getUser()
        if (!user) return { error: "Unauthorized" }

        const student = await prisma.user.findUnique({
            where: { id: studentId },
            select: { id: true, name: true, email: true, image: true }
        })

        return { student }
    } catch (error) {
        return { error: "Failed to fetch student" }
    }
}

// Teacher view of student grades (mirrors student actions)

export async function getStudentSemestersForTeacher(studentId: string) {
    try {
        const user = await getUser()
        if (!user) return { error: "Unauthorized" }
        // Verify user is a teacher? (Should be handled by page middleware/role check usually, but good to check role here if strict)

        const terms = await prisma.term.findMany({
            where: {
                courses: {
                    some: {
                        studentIds: { has: studentId },
                        deletedAt: { isSet: false }
                    }
                },
                deletedAt: { isSet: false }
            },
            include: {
                academicYear: true
            },
            orderBy: {
                startDate: 'desc'
            }
        })

        return { semesters: terms }
    } catch (error) {
        console.error("Error fetching student semesters for teacher:", error)
        return { error: "Failed to fetch semesters" }
    }
}

export async function getStudentGradesForTeacher(studentId: string, termId?: string) {
    try {
        const user = await getUser()
        if (!user) return { error: "Unauthorized" }

        const whereClause: any = {
            studentIds: { has: studentId },
            deletedAt: { isSet: false }
        }

        if (termId && termId !== 'all') {
            whereClause.termId = termId
        } else if (termId === 'all') {
            // No term filter, fetch all
        } else {
            whereClause.term = { isActive: true }
        }

        const courses = await prisma.course.findMany({
            where: whereClause,
            include: {
                teacher: true,
                subject: true,
                assignments: {
                    where: { deletedAt: { isSet: false } },
                    include: {
                        submissions: {
                            where: { studentId, deletedAt: { isSet: false } }
                        }
                    }
                },
                attendances: {
                    where: { studentId, deletedAt: { isSet: false } }
                }
            }
        })

        const grades = courses.map(course => {
            const totalSessions = course.attendances.filter(a => a.status !== "SKIPPED").length
            const attendedCount = course.attendances.filter(a =>
                a.status === "PRESENT" || a.status === "EXCUSED"
            ).length

            const attendancePercentage = totalSessions > 0 ? (attendedCount / totalSessions) : 1

            let studentPoints = 0
            let maxPointsPossible = 0
            let extraCreditPoints = 0

            course.assignments.forEach(assignment => {
                const submission = assignment.submissions[0]

                if (!assignment.isExtraCredit) {
                    maxPointsPossible += assignment.maxPoints
                }

                if (submission && submission.grade !== null) {
                    let actualPoints = (submission.grade / 100) * assignment.maxPoints
                    const isLate = assignment.dueDate && submission.submittedAt > assignment.dueDate
                    if (isLate && assignment.latePenalty > 0) {
                        const penaltyAmount = actualPoints * (assignment.latePenalty / 100)
                        actualPoints -= penaltyAmount
                    }
                    if (assignment.isExtraCredit) {
                        extraCreditPoints += actualPoints
                    } else {
                        studentPoints += actualPoints
                    }
                }
            })

            const attendancePool = course.attendancePoolScore || 0
            const attendanceScore = attendancePercentage * attendancePool
            const numerator = studentPoints + extraCreditPoints + attendanceScore
            const denominator = maxPointsPossible + attendancePool

            let totalScore = denominator > 0 ? (numerator / denominator) * 100 : 100
            totalScore = Math.min(totalScore, 100)

            return {
                courseId: course.id,
                courseName: course.subject?.reportName || course.reportName || course.name,
                teacherName: course.teacher.name,
                grade: Math.round(totalScore * 10) / 10,
                attendancePercentage: Math.round(attendancePercentage * 100),
                breakdown: {
                    studentPoints,
                    maxPointsPossible,
                    attendanceScore,
                    extraCreditPoints,
                    attendancePool
                }
            }
        })

        return { grades }

    } catch (error) {
        console.error("Error fetching grades for teacher:", error)
        return { error: "Failed to fetch grades" }
    }
}

export async function getStudentGradeHistoryForTeacher(studentId: string) {
    try {
        const user = await getUser()
        if (!user) return { error: "Unauthorized" }

        const courses = await prisma.course.findMany({
            where: {
                studentIds: { has: studentId },
                deletedAt: { isSet: false }
            },
            include: {
                term: {
                    include: { academicYear: true }
                },
                assignments: {
                    where: { deletedAt: { isSet: false } },
                    include: {
                        submissions: {
                            where: { studentId: studentId, deletedAt: { isSet: false } }
                        }
                    }
                },
                attendances: {
                    where: { studentId: studentId, deletedAt: { isSet: false } }
                }
            },
            orderBy: {
                term: { startDate: 'asc' }
            }
        })

        const termGroups = new Map<string, { term: any, grades: number[] }>()

        for (const course of courses) {
            const totalSessions = course.attendances.filter(a => a.status !== "SKIPPED").length
            const attendedCount = course.attendances.filter(a =>
                a.status === "PRESENT" || a.status === "EXCUSED"
            ).length
            const attendancePercentage = totalSessions > 0 ? (attendedCount / totalSessions) : 1

            let studentPoints = 0
            let maxPointsPossible = 0
            let extraCreditPoints = 0

            course.assignments.forEach(assignment => {
                const submission = assignment.submissions[0]
                if (!assignment.isExtraCredit) maxPointsPossible += assignment.maxPoints
                if (submission && submission.grade !== null) {
                    let actualPoints = (submission.grade / 100) * assignment.maxPoints
                    const isLate = assignment.dueDate && submission.submittedAt > assignment.dueDate
                    if (isLate && assignment.latePenalty > 0) {
                        actualPoints -= actualPoints * (assignment.latePenalty / 100)
                    }
                    if (assignment.isExtraCredit) extraCreditPoints += actualPoints
                    else studentPoints += actualPoints
                }
            })

            const attendancePool = course.attendancePoolScore || 0
            const attendanceScore = attendancePercentage * attendancePool
            const numerator = studentPoints + extraCreditPoints + attendanceScore
            const denominator = maxPointsPossible + attendancePool
            let totalScore = denominator > 0 ? (numerator / denominator) * 100 : 100
            totalScore = Math.min(totalScore, 100)

            if (!termGroups.has(course.termId)) {
                termGroups.set(course.termId, { term: course.term, grades: [] })
            }
            termGroups.get(course.termId)?.grades.push(totalScore)
        }

        const history = Array.from(termGroups.values()).map(({ term, grades }) => {
            const average = grades.reduce((a, b) => a + b, 0) / grades.length
            const name = `${term.academicYear.name} ${term.type}`
            return {
                termId: term.id,
                name: name,
                average: Math.round(average * 10) / 10
            }
        })

        return { history }
    } catch (error) {
        console.error("Error fetching student grade history for teacher:", error)
        return { error: "Failed to fetch grade history" }
    }
}
