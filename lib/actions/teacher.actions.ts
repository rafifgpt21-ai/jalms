"use server"

import { db as prisma } from "@/lib/db"
import { getUser } from "@/lib/actions/user.actions"
import { AssignmentType } from "@prisma/client"
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
    title: string
    description?: string
    courseId: string
    type: AssignmentType
    dueDate?: Date
    maxPoints: number
    isExtraCredit: boolean
    latePenalty: number
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
                    // Note: Using 'as any' to bypass potential type issues if types aren't regenerated yet, 
                    // but schema confirms these fields exist.
                    const s = sub as any
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
    assignmentId: string
    title: string
    description?: string
    type: AssignmentType
    dueDate?: Date
    maxPoints: number
    isExtraCredit: boolean
    latePenalty: number
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

            // 2. Calculate Student Points & Max Points
            let studentPoints = 0
            let maxPointsPossible = 0
            let extraCreditPoints = 0

            course.assignments.forEach(assignment => {
                const submission = assignment.submissions.find(s => s.studentId === student.id)

                // If assignment is NOT extra credit, it adds to MaxPointsPossible
                if (!assignment.isExtraCredit) {
                    maxPointsPossible += assignment.maxPoints
                }

                if (submission && submission.grade !== null) {
                    // Calculate actual points from percentage grade
                    let actualPoints = (submission.grade / 100) * assignment.maxPoints

                    // Apply Late Penalty
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
                totalScore = 100
            }

            // Cap at 100
            totalScore = Math.min(totalScore, 100)

            return {
                studentId: student.id,
                studentName: student.name,
                attendancePercentage: totalSessions > 0 ? (attendedCount / totalSessions) * 100 : 100,
                totalScore: Math.round(totalScore * 10) / 10,
                breakdown: {
                    studentPoints,
                    extraCreditPoints,
                    attendanceScore,
                    maxPointsPossible,
                    attendancePool
                }
            }
        })

        return { gradebook: gradebookData, courseName: course.name }

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

        // 1. Get Counts
        const coursesCount = await prisma.course.count({
            where: {
                teacherId,
                deletedAt: { isSet: false },
                term: { isActive: true }
            }
        })

        const studentsCount = await prisma.user.count({
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
        })

        const assignmentsCount = await prisma.assignment.count({
            where: {
                course: {
                    teacherId,
                    deletedAt: { isSet: false },
                    term: { isActive: true }
                },
                deletedAt: { isSet: false }
            }
        })

        // 2. Get Recent Submissions (last 5)
        const recentSubmissions = await prisma.submission.findMany({
            where: {
                assignment: {
                    course: {
                        teacherId,
                        term: { isActive: true }
                    },
                    deletedAt: { isSet: false }
                },
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
        })

        // 3. Get Upcoming Assignments (next 5)
        const upcomingAssignments = await prisma.assignment.findMany({
            where: {
                course: {
                    teacherId,
                    term: { isActive: true }
                },
                deletedAt: { isSet: false },
                dueDate: {
                    gte: new Date()
                }
            },
            take: 5,
            orderBy: { dueDate: 'asc' },
            include: {
                course: true,
                _count: {
                    select: { submissions: true }
                }
            }
        })

        return {
            stats: {
                courses: coursesCount,
                students: studentsCount,
                assignments: assignmentsCount
            },
            recentSubmissions,
            upcomingAssignments
        }

    } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        return { error: "Failed to fetch dashboard stats" }
    }
}
