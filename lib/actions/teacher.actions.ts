"use server"

import { db as prisma } from "@/lib/db"
import { getUser } from "@/lib/actions/user.actions"
import { AssignmentType, AcademicDomain, Submission } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function getTeachersWithCourses(search: string = "") {
    console.log("getTeachersWithCourses called with search:", search)
    try {
        const where: any = {
            taughtCourses: {
                some: {
                    deletedAt: { isSet: false },
                    term: { isActive: true }
                }
            },
            isActive: true,
            deletedAt: { isSet: false }
        }

        if (search) {
            where.name = { contains: search, mode: "insensitive" }
        }

        const teachers = await prisma.user.findMany({
            where,
            include: {
                taughtCourses: {
                    where: {
                        deletedAt: { isSet: false },
                        term: { isActive: true }
                    },
                    include: {
                        term: {
                            include: { academicYear: true }
                        },
                        class: true,
                        subject: true,
                        schedules: {
                            where: { deletedAt: { isSet: false } }
                        },
                        _count: {
                            select: { students: true }
                        }
                    }
                }
            },
            orderBy: {
                name: "asc"
            }
        })

        return { teachers }
    } catch (error) {
        console.error("Error fetching teachers with courses:", error)
        return { error: "Failed to fetch teachers" }
    }
}

export async function getTeacherActiveCourses(teacherId: string) {
    try {
        const courses = await prisma.course.findMany({
            where: {
                teacherId,
                deletedAt: { isSet: false },
                term: { isActive: true }
            },
            include: {
                term: true,
                class: true,
                subject: true,
                _count: {
                    select: { students: true, assignments: true }
                }
            },
            orderBy: {
                name: "asc"
            }
        })
        return { courses }
    } catch (error) {
        console.error("Error fetching teacher active courses:", error)
        return { error: "Failed to fetch courses" }
    }
}

export async function createAssignment(data: {
    quizId?: any
    title: string
    description?: string
    courseId: string
    type: AssignmentType
    dueDate?: Date
    maxPoints: number
    isExtraCredit: boolean
    latePenalty: number
    academicDomains?: AcademicDomain[]
    showGradeAfterSubmission?: boolean
}) {
    try {
        const assignment = await prisma.assignment.create({
            data: {
                title: data.title,
                description: data.description,
                courseId: data.courseId,
                type: data.type,
                dueDate: data.dueDate || new Date(),
                maxPoints: data.maxPoints,
                isExtraCredit: data.isExtraCredit,
                latePenalty: data.latePenalty,
                academicDomains: data.academicDomains || [],
                quizId: data.quizId,
                showGradeAfterSubmission: data.showGradeAfterSubmission ?? true,
            }
        })

        revalidatePath(`/teacher/courses/${data.courseId}`)
        return { assignment }
    } catch (error) {
        console.error("Error creating assignment:", error)
        return { error: "Failed to create assignment" }
    }
}

export async function getCourseAssignments(courseId: string) {
    try {
        const assignments = await prisma.assignment.findMany({
            where: {
                courseId,
                deletedAt: { isSet: false }
            },
            orderBy: {
                id: "asc"
            }
        })
        return { assignments }
    } catch (error) {
        console.error("Error fetching course assignments:", error)
        return { error: "Failed to fetch assignments" }
    }
}

export async function getAssignmentDetails(assignmentId: string) {
    try {
        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: {
                course: {
                    include: {
                        subject: true,
                        teacher: true,
                        students: {
                            orderBy: { name: "asc" }
                        }
                    }
                },
                submissions: {
                    where: { deletedAt: { isSet: false } }
                }
            }
        })
        return { assignment }
    } catch (error) {
        console.error("Error fetching assignment details:", error)
        return { error: "Failed to fetch assignment details" }
    }
}

export async function updateSubmissionScore(
    assignmentId: string,
    studentId: string,
    score: number | null
) {
    console.log(`updateSubmissionScore called for assignment ${assignmentId}, student ${studentId}, score ${score}`)
    try {
        if (score !== null && (score < 0 || score > 100)) {
            return { error: "Score must be between 0 and 100" }
        }

        // Find all active submissions
        const submissions = await prisma.submission.findMany({
            where: {
                assignmentId,
                studentId,
                deletedAt: { isSet: false }
            }
        })

        if (submissions.length > 0) {
            console.log(`Found ${submissions.length} existing submissions`)

            for (const sub of submissions) {
                // If un-grading (score is null)
                if (score === null) {
                    // Check if submission has any content
                    const s = sub as Submission
                    const hasContent = s.submissionUrl || s.attachmentUrl || s.link || s.feedback

                    if (!hasContent) {
                        // If no content, soft delete the submission (it was likely created just for grading)
                        console.log(`Soft deleting empty submission ${sub.id}`)
                        await prisma.submission.update({
                            where: { id: sub.id },
                            data: { deletedAt: new Date() }
                        })
                    } else {
                        // If has content, just remove the grade
                        console.log(`Removing grade from submission ${sub.id}`)
                        await prisma.submission.update({
                            where: { id: sub.id },
                            data: { grade: null }
                        })
                    }
                } else {
                    // Updating score
                    console.log(`Updating grade for submission ${sub.id} to ${score}`)
                    await prisma.submission.update({
                        where: { id: sub.id },
                        data: { grade: score }
                    })
                }
            }

            // Revalidate the page to ensure fresh data
            const assignment = await prisma.assignment.findUnique({
                where: { id: assignmentId },
                select: { courseId: true }
            })

            if (assignment) {
                revalidatePath(`/teacher/courses/${assignment.courseId}/tasks/${assignmentId}`)
            }

            return { submission: { count: submissions.length } }
        } else {
            console.log("No existing submission found")
            if (score === null) {
                return { error: "Cannot un-grade a non-existent submission" }
            }

            const created = await prisma.submission.create({
                data: {
                    assignmentId,
                    studentId,
                    grade: score,
                    submittedAt: new Date()
                }
            })

            // Revalidate here too
            const assignment = await prisma.assignment.findUnique({
                where: { id: assignmentId },
                select: { courseId: true }
            })

            if (assignment) {
                revalidatePath(`/teacher/courses/${assignment.courseId}/tasks/${assignmentId}`)
            }

            return { submission: created }
        }
    } catch (error) {
        console.error("Error updating submission score:", error)
        return { error: "Failed to update score" }
    }
}

export async function updateAssignment(data: {
    quizId?: any
    assignmentId: string
    title: string
    description?: string
    type: AssignmentType
    dueDate?: Date
    maxPoints: number
    isExtraCredit: boolean
    latePenalty: number
    academicDomains?: AcademicDomain[]
    showGradeAfterSubmission?: boolean
}) {
    try {
        const assignment = await prisma.assignment.update({
            where: { id: data.assignmentId },
            data: {
                title: data.title,
                description: data.description,
                type: data.type,
                dueDate: data.dueDate,
                maxPoints: data.maxPoints,
                isExtraCredit: data.isExtraCredit,
                latePenalty: data.latePenalty,
                academicDomains: data.academicDomains || [],
                quizId: data.quizId,
                showGradeAfterSubmission: data.showGradeAfterSubmission ?? true,
            },
        })

        revalidatePath(`/teacher/courses/${assignment.courseId}/tasks/${assignment.id}`)
        return { assignment }
    } catch (error) {
        console.error("Error updating assignment:", error)
        return { error: "Failed to update assignment" }
    }
}

export async function deleteAssignment(assignmentId: string) {
    try {
        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            select: { courseId: true }
        })

        if (!assignment) {
            return { error: "Assignment not found" }
        }

        // Soft delete
        await prisma.assignment.update({
            where: { id: assignmentId },
            data: { deletedAt: new Date() }
        })

        revalidatePath(`/teacher/courses/${assignment.courseId}`)
        return { success: true, courseId: assignment.courseId }
    } catch (error) {
        console.error("Error deleting assignment:", error)
        return { error: "Failed to delete assignment" }
    }
}


export async function getCourseGradebook(courseId: string) {
    try {
        const user = await getUser()
        if (!user) return { error: "Unauthorized" }

        // Fetch course with students, assignments, submissions, and attendance
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                students: {
                    orderBy: { name: 'asc' }
                },
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
        })

        if (!course) return { error: "Course not found" }
        if (course.teacherId !== user.id) return { error: "Unauthorized" }

        const attendancePool = course.attendancePoolScore || 0

        // Calculate Course Total Max Points
        // Sum of all non-extra-credit assignments + attendance pool
        const courseMaxPoints = course.assignments.reduce((sum, assignment) => {
            return !assignment.isExtraCredit ? sum + assignment.maxPoints : sum
        }, 0) + attendancePool

        const gradebookData = course.students.map(student => {
            // 1. Calculate Attendance %
            const studentAttendance = course.attendances.filter(a => a.studentId === student.id)

            // Count Present and Excused as "Attended"
            // Exclude SKIPPED from total sessions
            const totalSessions = studentAttendance.filter(a => a.status !== "SKIPPED").length

            const attendedCount = studentAttendance.filter(a =>
                a.status === "PRESENT" || a.status === "EXCUSED"
            ).length

            const attendancePercentage = totalSessions > 0 ? (attendedCount / totalSessions) : 1

            // 2. Calculate Student Points & Max Points (Student Context)
            let studentPoints = 0
            let maxPointsPossible = 0
            let extraCreditPoints = 0
            const scores: Record<string, number | null> = {}

            course.assignments.forEach(assignment => {
                const submission = assignment.submissions.find(s => s.studentId === student.id)
                let actualPoints: number | null = null

                if (submission && submission.grade !== null) {
                    actualPoints = Number((submission.grade / 100) * assignment.maxPoints)

                    // Apply Late Penalty
                    const isLate = assignment.dueDate && submission.submittedAt > assignment.dueDate
                    if (isLate && assignment.latePenalty > 0) {
                        const penaltyAmount = actualPoints * (assignment.latePenalty / 100)
                        actualPoints -= penaltyAmount
                    }

                    // Round to 2 decimals
                    actualPoints = Math.round(actualPoints * 100) / 100
                }

                scores[assignment.id] = actualPoints

                // Calculation for Total Score
                if (!assignment.isExtraCredit) {
                    maxPointsPossible += assignment.maxPoints
                }

                if (actualPoints !== null) {
                    if (assignment.isExtraCredit) {
                        extraCreditPoints += actualPoints
                    } else {
                        studentPoints += actualPoints
                    }
                }
            })

            // 3. Apply Formula
            const attendanceScore = attendancePercentage * attendancePool

            const numerator = studentPoints + extraCreditPoints + attendanceScore
            const denominator = maxPointsPossible + attendancePool

            let totalScore = 0
            if (denominator > 0) {
                totalScore = (numerator / denominator) * 100
            } else {
                totalScore = 100
            }

            // Cap at 100
            totalScore = Math.min(totalScore, 100)

            return {
                studentId: student.id,
                studentName: student.name,
                studentImage: student.image,
                attendancePercentage: totalSessions > 0 ? (attendedCount / totalSessions) * 100 : 100,
                totalScore: Math.round(totalScore * 10) / 10,
                earnedPoints: Math.round(numerator * 10) / 10,
                scores,
                breakdown: {
                    studentPoints,
                    extraCreditPoints,
                    attendanceScore,
                    maxPointsPossible,
                    attendancePool
                }
            }
        })

        const assignmentMetadata = course.assignments.map(a => ({
            id: a.id,
            title: a.title,
            maxPoints: a.maxPoints,
            isExtraCredit: a.isExtraCredit,
            dueDate: a.dueDate,
            type: a.type
        }))

        return { gradebook: gradebookData, assignments: assignmentMetadata, courseName: course.name, maxPoints: courseMaxPoints }

    } catch (error) {
        console.error("Error fetching gradebook:", error)
        return { error: `Failed to fetch gradebook: ${(error as Error).message}` }
    }
}

export async function getTeacherDashboardStats() {
    try {
        const user = await getUser()
        if (!user) return { error: "Unauthorized" }
        const teacherId = user.id

        // Date calculations for classes today
        const dayOfWeek = new Date().getDay()
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        // Step 1: Fetch Base Data (Assignments, Students, Classes, Active Courses)
        // We removed separate count queries as they are derived from arrays
        const [
            studentsCount,
            allAssignments,
            activeCourses,
            rawClassesToday
        ] = await Promise.all([
            // 1. Students Count
            prisma.user.count({
                where: {
                    roles: { has: "STUDENT" },
                    enrolledCourses: {
                        some: {
                            teacherId,
                            deletedAt: { isSet: false },
                            term: { isActive: true }
                        }
                    }
                }
            }),

            // 2. All Assignments (Used for dashboard widget AND to get IDs for other queries)
            prisma.assignment.findMany({
                where: {
                    course: {
                        teacherId,
                        term: { isActive: true },
                        deletedAt: { isSet: false },
                    },
                    deletedAt: { isSet: false },
                },
                orderBy: { dueDate: 'asc' },
                include: {
                    course: {
                        select: {
                            id: true,
                            name: true,
                            _count: {
                                select: { students: true }
                            }
                        }
                    },
                    // Get graded submissions count
                    submissions: {
                        where: {
                            grade: { not: null },
                            deletedAt: { isSet: false }
                        },
                        select: { id: true }
                    }
                }
            }),

            // 3. Active Courses (Used for filter AND course count)
            prisma.course.findMany({
                where: {
                    teacherId,
                    term: { isActive: true },
                    deletedAt: { isSet: false }
                },
                select: { id: true, name: true },
                orderBy: { name: 'asc' }
            }),

            // 4. Raw Classes Today
            prisma.schedule.findMany({
                where: {
                    dayOfWeek,
                    course: {
                        teacherId,
                        term: { isActive: true },
                        deletedAt: { isSet: false }
                    },
                    deletedAt: { isSet: false }
                },
                orderBy: { period: 'asc' },
                include: {
                    course: {
                        include: {
                            class: true,
                            subject: true,
                            term: true
                        }
                    }
                }
            })
        ])

        // Step 2: Dependent Queries (Submissions)
        // Use assignment IDs to filter instead of deep relation filter
        const assignmentIds = allAssignments.map(a => a.id)

        const [
            recentSubmissions,
            ungradedCount
        ] = await Promise.all([
            // 5. Recent Submissions (Optimized with ID filter)
            prisma.submission.findMany({
                where: {
                    assignmentId: { in: assignmentIds },
                    deletedAt: { isSet: false }
                },
                take: 5,
                orderBy: { submittedAt: 'desc' },
                include: {
                    student: true,
                    assignment: {
                        include: { course: true }
                    }
                }
            }),

            // 6. Ungraded Count (Optimized with ID filter)
            prisma.submission.count({
                where: {
                    grade: null,
                    assignmentId: { in: assignmentIds },
                    deletedAt: { isSet: false }
                }
            })
        ])

        // Filter valid schedules based on term dates
        const validClassesToday = rawClassesToday.filter(schedule => {
            const term = schedule.course.term
            // Ensure we compare just dates or handle time correctly
            // Assuming startDate and endDate are set to midnight or relevant boundaries
            const targetDate = new Date(today)
            return targetDate >= term.startDate && targetDate <= term.endDate
        })

        // Optimize Topic Fetching (Batch Query)
        let attendanceRecords: { topic: string | null, courseId: string, period: number }[] = []

        if (validClassesToday.length > 0) {
            const courseIds = validClassesToday.map(s => s.courseId)

            attendanceRecords = await prisma.attendance.findMany({
                where: {
                    courseId: { in: courseIds },
                    date: {
                        gte: today,
                        lt: tomorrow
                    },
                    deletedAt: { isSet: false },
                },
                select: { topic: true, courseId: true, period: true }
            })
        }

        // Map topics to classes
        const classesToday = validClassesToday.map(schedule => {
            const attendance = attendanceRecords.find(a =>
                a.courseId === schedule.courseId && a.period === schedule.period
            )
            return {
                ...schedule,
                topic: attendance?.topic || null
            }
        })

        return {
            stats: {
                courses: activeCourses.length,
                students: studentsCount,
                assignments: allAssignments.length,
                ungraded: ungradedCount
            },
            recentSubmissions,
            allAssignments,
            activeCourses,
            classesToday
        }

    } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        return { error: "Failed to fetch dashboard stats" }
    }
}

export async function getCourseTaskSummary(courseId: string) {
    try {
        const sessionUser = await getUser()

        if (!sessionUser?.id) return { error: "Unauthorized - No User" }

        // Fetch full user to check roles
        const user = await prisma.user.findUnique({
            where: { id: sessionUser.id },
            select: { id: true, roles: true }
        })

        if (!user) return { error: "User not found" }

        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                students: {
                    orderBy: { name: 'asc' }
                },
                assignments: {
                    where: { deletedAt: { isSet: false } },
                    orderBy: { dueDate: 'asc' },
                    include: {
                        submissions: {
                            where: { deletedAt: { isSet: false } }
                        }
                    }
                }
            }
        })

        if (!course) return { error: "Course not found" }

        const isTeacher = course.teacherId === user.id
        const isAdmin = user.roles.includes("ADMIN")

        if (!isTeacher && !isAdmin) {
            return { error: "Unauthorized - Teacher Mismatch" }
        }

        const summaryData = course.students.map(student => {
            const studentTasks = course.assignments.map(assignment => {
                const submission = assignment.submissions.find(s => s.studentId === student.id)

                let status: "MISSING" | "SUBMITTED" | "GRADED" | "PENDING" = "PENDING"

                if (submission) {
                    if (submission.grade !== null) {
                        status = "GRADED"
                    } else {
                        status = "SUBMITTED"
                    }
                } else {
                    const now = new Date()
                    if (assignment.dueDate && now > assignment.dueDate) {
                        status = "MISSING"
                    } else {
                        status = "PENDING"
                    }
                }

                return {
                    assignmentId: assignment.id,
                    assignmentTitle: assignment.title,
                    status,
                    grade: submission?.grade ?? null,
                    maxPoints: assignment.maxPoints
                }
            })

            return {
                studentId: student.id,
                studentName: student.name,
                studentAvatar: student.image,
                tasks: studentTasks
            }
        })

        return {
            data: summaryData,
            assignments: course.assignments.map(a => ({ id: a.id, title: a.title, dueDate: a.dueDate })),
            courseName: course.name
        }

    } catch (error) {
        console.error("Error fetching task summary:", error)
        return { error: "Failed to fetch task summary" }
    }
}
