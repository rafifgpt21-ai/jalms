"use server"

import { db as prisma } from "@/lib/db"
import { getUser } from "@/lib/actions/user.actions"
import { revalidatePath } from "next/cache"

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

        // 1. Get Today's Schedule
        const today = new Date()
        const dayOfWeek = today.getDay() // 0=Sunday, 1=Monday...

        const schedule = await prisma.schedule.findMany({
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
        })

        // 1.1 Enrich schedule with Topic info
        const startOfDay = new Date(today)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(today)
        endOfDay.setHours(23, 59, 59, 999)

        const scheduleWithTopics = await Promise.all(schedule.map(async (slot) => {
            const attendance = await prisma.attendance.findFirst({
                where: {
                    courseId: slot.courseId,
                    period: slot.period,
                    date: {
                        gte: startOfDay,
                        lte: endOfDay
                    },
                    deletedAt: { isSet: false }
                },
                select: { topic: true }
            })
            return {
                ...slot,
                topic: attendance?.topic || null
            }
        }))

        // 2. Get Upcoming Deadlines (Next 5)
        const upcomingDeadlines = await prisma.assignment.findMany({
            where: {
                course: {
                    studentIds: { has: studentId },
                    term: { isActive: true },
                    deletedAt: { isSet: false }
                },
                deletedAt: { isSet: false },
                type: "SUBMISSION",
                OR: [
                    { dueDate: { gte: new Date() } },
                    {
                        AND: [
                            { dueDate: { lt: new Date() } },
                            { submissions: { none: { studentId } } }
                        ]
                    }
                ]
            },
            take: 5,
            orderBy: { dueDate: 'asc' },
            include: {
                course: true,
                submissions: {
                    where: { studentId }
                }
            }
        })

        // 3. Recent Activity (New assignments or Graded submissions)
        // For now, let's just show recent graded submissions
        const recentGrades = await prisma.submission.findMany({
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


        return {
            schedule: scheduleWithTopics,
            upcomingDeadlines,
            recentGrades
        }

    } catch (error) {
        console.error("Error fetching student dashboard stats:", error)
        return { error: "Failed to fetch dashboard stats" }
    }
}

export async function getStudentGrades() {
    try {
        const user = await getUser()
        if (!user) return { error: "Unauthorized" }

        const studentId = user.id

        const courses = await prisma.course.findMany({
            where: {
                studentIds: { has: studentId },
                deletedAt: { isSet: false },
                term: { isActive: true }
            },
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
                    attendanceScore
                }
            }
        })

        return { grades }




    } catch (error) {
        console.error("Error fetching student grades:", error)
        return { error: "Failed to fetch grades" }
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

import { UTApi } from "uploadthing/server"

const utapi = new UTApi()

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

        // 2. Delete from UploadThing
        const fileKey = fileUrl.split("/").pop()
        if (fileKey) {
            await utapi.deleteFiles(fileKey)
        }

        return { success: true }
    } catch (error) {
        console.error("Error deleting submission file:", error)
        return { error: "Failed to delete file" }
    }
}
