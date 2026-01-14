"use server"

import { db as prisma } from "@/lib/db"
import { getUser } from "@/lib/actions/user.actions"
import { revalidatePath } from "next/cache"

import { unlink } from "fs/promises"
import path from "path"

export async function getStudentCourses() {
    try {
        const user = await getUser()
        if (!user) return { error: "Unauthorized" }

        const courses = await prisma.course.findMany({
            where: {
                studentIds: { has: user.id },
                deletedAt: { isSet: false },
                term: { isActive: true }
            },
            include: {
                teacher: true,
                term: true,
                _count: {
                    select: { assignments: true }
                }
            },
            orderBy: {
                name: "asc"
            }
        })

        return { courses }
    } catch (error) {
        console.error("Error fetching student courses:", error)
        return { error: "Failed to fetch courses" }
    }
}

export async function getStudentDashboardStats() {
    try {
        const user = await getUser()
        if (!user) return { error: "Unauthorized" }

        const studentId = user.id

        const today = new Date()
        const dayOfWeek = today.getDay() // 0=Sunday, 1=Monday...

        // Date boundaries for attendance
        const startOfDay = new Date(today)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(today)
        endOfDay.setHours(23, 59, 59, 999)

        // Run independent queries in parallel
        const [schedule, allAssignments, recentGrades] = await Promise.all([
            // 1. Get Today's Schedule
            prisma.schedule.findMany({
                where: {
                    dayOfWeek,
                    course: {
                        studentIds: { has: studentId },
                        term: { isActive: true },
                        deletedAt: { isSet: false }
                    },
                    deletedAt: { isSet: false }
                },
                include: {
                    course: {
                        include: { teacher: true }
                    }
                },
                orderBy: {
                    period: 'asc'
                }
            }),

            // 2. Get ALL Assignments for active courses (Filter in memory for speed)
            // Complex OR/NOT EXISTS query was taking ~20s. Fetching all is much faster.
            prisma.assignment.findMany({
                where: {
                    course: {
                        studentIds: { has: studentId },
                        term: { isActive: true },
                        deletedAt: { isSet: false }
                    },
                    deletedAt: { isSet: false },
                    type: { in: ["SUBMISSION", "QUIZ"] }
                },
                include: {
                    course: true,
                    submissions: {
                        where: {
                            studentId,
                            deletedAt: { isSet: false }
                        },
                        select: { id: true, submittedAt: true }
                    }
                }
            }),

            // 3. Recent Activity (New assignments or Graded submissions)
            prisma.submission.findMany({
                where: {
                    studentId,
                    grade: { not: null },
                    deletedAt: { isSet: false }
                },
                take: 5,
                orderBy: { submittedAt: 'desc' },
                include: {
                    assignment: {
                        include: { course: true }
                    }
                }
            })
        ])

        // 1.1 Enrich schedule with Topic info (Batch optimized)
        const courseIds = schedule.map(s => s.courseId)

        let attendanceTopics: { topic: string | null, status: string, courseId: string, period: number }[] = []

        if (courseIds.length > 0) {
            attendanceTopics = await prisma.attendance.findMany({
                where: {
                    courseId: { in: courseIds },
                    date: {
                        gte: startOfDay,
                        lte: endOfDay
                    },
                    deletedAt: { isSet: false }
                },
                select: { topic: true, status: true, courseId: true, period: true }
            })
        }

        const filteredSchedule = schedule.map(slot => {
            const attendance = attendanceTopics.find(a =>
                a.courseId === slot.courseId && a.period === slot.period
            )
            return {
                ...slot,
                topic: attendance?.topic || null,
                isSkipped: attendance?.status === "SKIPPED"
            }
        }).filter(slot => !slot.isSkipped)

        // 2.1 Process Upcoming Deadlines in Memory
        const now = new Date()
        const upcomingDeadlines = allAssignments.filter(assignment => {
            if (!assignment.dueDate) return false

            // Allow if due in future
            if (assignment.dueDate >= now) return true

            // Allow if Overdue AND Not Submitted
            const isSubmitted = assignment.submissions.length > 0
            if (assignment.dueDate < now && !isSubmitted) return true

            return false
        }).sort((a, b) => {
            // Sort by due date ascending
            if (!a.dueDate || !b.dueDate) return 0
            return a.dueDate.getTime() - b.dueDate.getTime()
        }).slice(0, 5)


        return {
            schedule: filteredSchedule,
            upcomingDeadlines,
            recentGrades
        }

    } catch (error) {
        console.error("Error fetching student dashboard stats:", error)
        return { error: "Failed to fetch dashboard stats" }
    }
}

export async function getStudentSemesters() {
    try {
        const user = await getUser()
        if (!user) return { error: "Unauthorized" }

        const terms = await prisma.term.findMany({
            where: {
                courses: {
                    some: {
                        studentIds: { has: user.id },
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
        console.error("Error fetching student semesters:", error)
        return { error: "Failed to fetch semesters" }
    }
}

export async function getStudentGrades(termId?: string) {
    try {
        const user = await getUser()
        if (!user) return { error: "Unauthorized" }

        const studentId = user.id

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
            // 1. Calculate Attendance %
            // Count Present and Excused as "Attended"
            // Exclude SKIPPED from total sessions if we treat it as "Class Cancelled"
            // But if SKIPPED is "Student Skipped", it should count as absent.
            // Let's assume SKIPPED is "Student Skipped" (Absent) for now based on typical usage, 
            // OR if it means "Excused/Exempt", it shouldn't count. 
            // Teacher gradebook logic: totalSessions = filter(a => a.status !== "SKIPPED").length
            // So SKIPPED is excluded from denominator.

            const totalSessions = course.attendances.filter(a => a.status !== "SKIPPED").length
            const attendedCount = course.attendances.filter(a =>
                a.status === "PRESENT" || a.status === "EXCUSED"
            ).length

            const attendancePercentage = totalSessions > 0 ? (attendedCount / totalSessions) : 1

            // 2. Calculate Points
            let studentPoints = 0
            let maxPointsPossible = 0
            let extraCreditPoints = 0

            course.assignments.forEach(assignment => {
                const submission = assignment.submissions[0] // Should be only one per student

                if (!assignment.isExtraCredit) {
                    maxPointsPossible += assignment.maxPoints
                }

                if (submission && submission.grade !== null) {
                    let actualPoints = (submission.grade / 100) * assignment.maxPoints

                    // Late Penalty
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

            // 3. Apply Formula
            const attendancePool = course.attendancePoolScore || 0
            const attendanceScore = attendancePercentage * attendancePool

            const numerator = studentPoints + extraCreditPoints + attendanceScore
            const denominator = maxPointsPossible + attendancePool

            let totalScore = 0
            if (denominator > 0) {
                totalScore = (numerator / denominator) * 100
            } else {
                // If no assignments and no attendance pool, start at 100? Or 0?
                // Usually 100 if nothing to grade yet.
                totalScore = 100
            }

            totalScore = Math.min(totalScore, 100)

            return {
                courseId: course.id,
                courseName: course.reportName || course.name,
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
        console.error("Error fetching student grades:", error)
        return { error: "Failed to fetch grades" }
    }
}

export async function getStudentGradeHistory() {
    try {
        const user = await getUser()
        if (!user) return { error: "Unauthorized" }

        const courses = await prisma.course.findMany({
            where: {
                studentIds: { has: user.id },
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
                            where: { studentId: user.id, deletedAt: { isSet: false } }
                        }
                    }
                },
                attendances: {
                    where: { studentId: user.id, deletedAt: { isSet: false } }
                }
            },
            orderBy: {
                term: { startDate: 'asc' }
            }
        })

        const termGroups = new Map<string, { term: any, grades: number[] }>()

        for (const course of courses) {
            // Calculate Grade (Logic duplicated from getStudentGrades for now)
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
        console.error("Error fetching student grade history:", error)
        return { error: "Failed to fetch grade history" }
    }
}

export async function submitAssignment(assignmentId: string, content: string, attachmentUrl?: string, link?: string) {
    try {
        const user = await getUser()
        if (!user || !user.id) return { error: "Unauthorized" }

        // Check if assignment exists and is open
        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId }
        })

        if (!assignment) return { error: "Assignment not found" }

        // Check if already submitted?
        const existing = await prisma.submission.findFirst({
            where: {
                assignmentId,
                studentId: user.id,
                deletedAt: { isSet: false }
            }
        })

        if (existing) {
            // Update existing submission
            const updateData: any = {
                submittedAt: new Date(),
                submissionUrl: content,
                link: link || null
            }

            if (attachmentUrl !== undefined) {
                updateData.attachmentUrl = attachmentUrl
            }

            await prisma.submission.update({
                where: { id: existing.id },
                data: updateData
            })

        } else {
            // Create new
            await prisma.submission.create({
                data: {
                    assignmentId,
                    studentId: user.id,
                    submittedAt: new Date(),
                    submissionUrl: content,
                    attachmentUrl,
                    link
                }
            })
        }

        revalidatePath(`/student/courses/${assignment.courseId}/tasks/${assignmentId}`)
        return { success: true }

    } catch (error) {
        console.error("Error submitting assignment:", error)
        return { error: "Failed to submit assignment" }
    }
}



export async function deleteSubmissionFile(assignmentId: string, fileUrl: string) {
    try {
        const user = await getUser()
        if (!user || !user.id) return { error: "Unauthorized" }

        // 1. Try to remove from DB if it exists there
        const existing = await prisma.submission.findFirst({
            where: {
                assignmentId,
                studentId: user.id,
                deletedAt: { isSet: false }
            }
        })

        if (existing && existing.attachmentUrl === fileUrl) {
            await prisma.submission.update({
                where: { id: existing.id },
                data: { attachmentUrl: null }
            })
        }

        // 2. Delete from UploadThing or Local Storage
        if (fileUrl.startsWith("/api/files/")) {
            // Local file deletion
            try {
                // Remove /api/files/ prefix to get the relative path
                const relativePath = fileUrl.replace(/^\/api\/files\//, "")

                // Construct full path: process.cwd() + /uploads + /relativePath
                // Note: route.ts serves files from process.cwd() + /uploads
                const fullPath = path.join(process.cwd(), "uploads", relativePath)

                // We should probably check if it exists before unlinking to avoid error, 
                // but unlink might throw if not found anyway, which we catch below.
                await unlink(fullPath)
            } catch (fsError) {
                console.error("Error deleting local file:", fsError)
                // Continue execution to update DB even if file delete fails (e.g. file already gone)
            }
        }


        return { success: true }
    } catch (error) {
        console.error("Error deleting submission file:", error)
        return { error: "Failed to delete file" }
    }
}

export async function submitQuizAttempt(assignmentId: string, answers: Record<string, string>) {
    try {
        const user = await getUser()
        if (!user || !user.id) return { error: "Unauthorized" }

        // 1. Fetch Assignment and Quiz with Correct Answers
        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: {
                quiz: {
                    include: {
                        questions: {
                            include: {
                                choices: true
                            }
                        }
                    }
                }
            }
        })

        if (!assignment || !assignment.quiz) return { error: "Quiz not found" }

        // 2. Calculate Score
        let correctCount = 0
        let totalQuestions = assignment.quiz.questions.length

        // If no questions, score is 0 or 100? Assume 0.
        if (totalQuestions === 0) return { error: "Quiz has no questions" }

        assignment.quiz.questions.forEach(q => {
            // Find the correct choice ID
            const correctChoice = q.choices.find(c => c.isCorrect)
            // Check student answer (which should be choiceId)
            // The key in 'answers' is questionId
            const studentAnswerId = answers[q.id]

            if (correctChoice && studentAnswerId === correctChoice.id) {
                correctCount++
            }
        })

        const score = (correctCount / totalQuestions) * 100
        const roundedScore = Math.round(score * 10) / 10 // 1 decimal

        // 3. Save Submission
        // Check for existing to forbid re-submission? Or update?
        // Usually quizzes are one-time or allow retries. Let's assume one-time or overwrite for now.
        const existing = await prisma.submission.findFirst({
            where: {
                assignmentId,
                studentId: user.id,
                deletedAt: { isSet: false }
            }
        })

        if (existing) {
            // If already graded, maybe prevent? But user might want to retake if allowed. 
            // For safety, let's update.
            await prisma.submission.update({
                where: { id: existing.id },
                data: {
                    grade: roundedScore,
                    submittedAt: new Date(),
                    // Store answers as generic json in feedback or new field? 
                    // Schema doesn't have 'answers' field. 
                    // We could stick it in 'submissionUrl' as JSON string if we really want to persist their choices.
                    submissionUrl: JSON.stringify(answers), // Storing answers as JSON string
                }
            })
        } else {
            await prisma.submission.create({
                data: {
                    assignmentId,
                    studentId: user.id,
                    grade: roundedScore,
                    submittedAt: new Date(),
                    submissionUrl: JSON.stringify(answers),
                }
            })
        }

        revalidatePath(`/student/courses/${assignment.courseId}/tasks/${assignmentId}`)
        return { success: true, grade: roundedScore }

    } catch (error) {
        console.error("Error submitting quiz:", error)
        return { error: "Failed to submit quiz" }
    }
}
