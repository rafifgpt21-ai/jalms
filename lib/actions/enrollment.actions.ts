"use server"

import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

// Get students enrolled in a specific class
export async function getEnrolledStudents(classId: string) {
    try {
        const enrollments = await prisma.enrollment.findMany({
            where: {
                classId,
                // deletedAt: null // Assuming soft delete might be used later, but schema has it
            },
            include: {
                student: true
            },
            orderBy: {
                student: {
                    name: "asc"
                }
            }
        })

        // Flatten the result to return just the students with enrollment ID
        const students = enrollments.map(e => ({
            ...e.student,
            enrollmentId: e.id,
            enrolledAt: e.id // Using ID as proxy for time if created_at missing on enrollment, or just return student data
        }))

        return { students, error: undefined }
    } catch (error) {
        console.error("Error fetching enrolled students:", error)
        return { error: "Failed to fetch enrolled students", students: [] }
    }
}

// Get students NOT enrolled in the class (for the dropdown)
// Limit to 10 for performance as requested
export async function getAvailableStudents(classId: string, search: string = "") {
    try {
        // 1. Get IDs of students already enrolled in this class
        const existingEnrollments = await prisma.enrollment.findMany({
            where: { classId },
            select: { studentId: true }
        })

        const enrolledStudentIds = existingEnrollments.map(e => e.studentId)

        // 2. Find students who are NOT in that list AND match the search
        const students = await prisma.user.findMany({
            where: {
                AND: [
                    {
                        roles: { has: "STUDENT" }
                    },
                    {
                        isActive: true
                    },
                    {
                        id: { notIn: enrolledStudentIds }
                    },
                    search ? {
                        OR: [
                            { name: { contains: search, mode: "insensitive" } },
                            { email: { contains: search, mode: "insensitive" } }
                        ]
                    } : {}
                ]
            },
            take: 10, // Limit to 10 as requested
            orderBy: { name: "asc" },
            select: {
                id: true,
                name: true,
                email: true,
                officialId: true
            }
        })

        return { students, error: undefined }
    } catch (error) {
        console.error("Error fetching available students:", error)
        return { error: "Failed to fetch students", students: [] }
    }
}

export async function enrollStudent(classId: string, studentId: string) {
    try {
        // Check if already enrolled
        const existing = await prisma.enrollment.findFirst({
            where: {
                classId,
                studentId
            }
        })

        if (existing) {
            return { error: "Student is already enrolled in this class" }
        }

        await prisma.enrollment.create({
            data: {
                classId,
                studentId
            }
        })

        revalidatePath(`/admin/classes/${classId}`)
        return { success: true, error: undefined }
    } catch (error) {
        console.error("Error enrolling student:", error)
        return { success: false, error: "Failed to enroll student" }
    }
}

export async function removeStudent(classId: string, studentId: string) {
    console.log(`[removeStudent] Attempting to remove student ${studentId} from class ${classId}`)
    try {
        // Find the enrollment record first to ensure we delete the right one
        // We delete by composite check or findMany then delete
        // Simpler to deleteMany with where clause for safety
        const result = await prisma.enrollment.deleteMany({
            where: {
                classId,
                studentId
            }
        })

        console.log(`[removeStudent] Delete result:`, result)

        if (result.count === 0) {
            console.warn(`[removeStudent] No enrollment found for class ${classId} and student ${studentId}`)
            return { error: "Student not found in this class or already removed" }
        }

        revalidatePath(`/admin/classes/${classId}`)
        return { success: true, error: undefined }
    } catch (error) {
        console.error("Error removing student:", error)
        return { success: false, error: "Failed to remove student" }
    }
}

// --- Course Enrollment Actions ---

export async function getAvailableStudentsForCourse(courseId: string, search: string = "") {
    try {
        // 1. Get the course to find currently enrolled student IDs
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { studentIds: true }
        })

        if (!course) return { error: "Course not found", students: [] }

        const enrolledStudentIds = course.studentIds

        // 2. Find students NOT in that list
        const students = await prisma.user.findMany({
            where: {
                AND: [
                    { roles: { has: "STUDENT" } },
                    { isActive: true },
                    { id: { notIn: enrolledStudentIds } },
                    search ? {
                        OR: [
                            { name: { contains: search, mode: "insensitive" } },
                            { email: { contains: search, mode: "insensitive" } }
                        ]
                    } : {}
                ]
            },
            take: 10,
            orderBy: { name: "asc" },
            select: {
                id: true,
                name: true,
                email: true,
                officialId: true
            }
        })

        return { students, error: undefined }
    } catch (error) {
        console.error("Error fetching available students for course:", error)
        return { error: "Failed to fetch students", students: [] }
    }
}

export async function enrollStudentToCourse(courseId: string, studentId: string) {
    try {
        // Check if already enrolled (though UI should prevent this, good to verify)
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { studentIds: true }
        })

        if (!course) return { error: "Course not found" }
        if (course.studentIds.includes(studentId)) {
            return { error: "Student is already enrolled in this course" }
        }

        // Check for schedule conflicts
        const { checkStudentScheduleConflict } = await import("@/lib/helpers/schedule-conflict")
        const conflict = await checkStudentScheduleConflict(studentId, courseId)

        if (conflict) {
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            return {
                error: `Schedule conflict with ${conflict.courseName} on ${days[conflict.dayOfWeek]} Period ${conflict.period}`
            }
        }

        // Connect the student to the course
        await prisma.course.update({
            where: { id: courseId },
            data: {
                students: {
                    connect: { id: studentId }
                }
            }
        })

        revalidatePath(`/admin/courses/${courseId}`)
        return { success: true, error: undefined }
    } catch (error) {
        console.error("Error enrolling student to course:", error)
        return { success: false, error: "Failed to enroll student" }
    }
}

export async function removeStudentFromCourse(courseId: string, studentId: string) {
    console.log(`[removeStudentFromCourse] Attempting to remove student ${studentId} from course ${courseId}`)
    try {
        // Check if student is enrolled first
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { studentIds: true }
        })

        if (!course) return { error: "Course not found" }

        if (!course.studentIds.includes(studentId)) {
            console.warn(`[removeStudentFromCourse] Student ${studentId} not found in course ${courseId}`)
            return { error: "Student is not enrolled in this course" }
        }

        await prisma.course.update({
            where: { id: courseId },
            data: {
                students: {
                    disconnect: { id: studentId }
                }
            }
        })

        console.log(`[removeStudentFromCourse] Successfully removed student ${studentId}`)
        revalidatePath(`/admin/courses/${courseId}`)
        return { success: true, error: undefined }
    } catch (error) {
        console.error("Error removing student from course:", error)
        return { success: false, error: "Failed to remove student" }
    }
}

export async function enrollClassToCourse(courseId: string, classId: string) {
    try {
        // 1. Get all students in the class
        const enrollments = await prisma.enrollment.findMany({
            where: { classId },
            select: { studentId: true }
        })

        if (enrollments.length === 0) {
            return { error: "No students found in this class" }
        }

        const studentIdsToAdd = enrollments.map(e => e.studentId)

        // 2. Add them to the course (connect)
        // Prisma's connect will ignore if already connected? No, it might throw if unique constraint violated on join table?
        // For many-to-many with explicit relation table it might be different, but here it's implicit or array of IDs.
        // If it's array of IDs (MongoDB), we can just push unique IDs.

        // Let's fetch the course first to get current students
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { studentIds: true }
        })

        if (!course) return { error: "Course not found" }

        const currentStudentIds = new Set(course.studentIds)
        const newStudentIds = studentIdsToAdd.filter(id => !currentStudentIds.has(id))

        if (newStudentIds.length === 0) {
            return { message: "All students from this class are already enrolled" }
        }

        // Check conflicts for each new student
        const { checkStudentScheduleConflict } = await import("@/lib/helpers/schedule-conflict")
        const conflicts = []
        const validStudentIds = []

        for (const studentId of newStudentIds) {
            const conflict = await checkStudentScheduleConflict(studentId, courseId)
            if (conflict) {
                // Fetch student name for better error message (optional, but nice)
                const student = await prisma.user.findUnique({ where: { id: studentId }, select: { name: true } })
                const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
                conflicts.push(`${student?.name || 'Student'}: Conflict with ${conflict.courseName} on ${days[conflict.dayOfWeek]} Period ${conflict.period}`)
            } else {
                validStudentIds.push(studentId)
            }
        }

        if (conflicts.length > 0) {
            // If any conflicts, we could either:
            // 1. Fail the whole batch
            // 2. Enroll only valid ones and report conflicts
            // Let's fail the batch for safety and simplicity, or user preference?
            // Usually batch operations should be atomic or report partial success.
            // Given the UI likely doesn't handle partial success well, let's fail and report.
            return { error: `Cannot enroll class. Conflicts found:\n${conflicts.join('\n')}` }
        }

        await prisma.course.update({
            where: { id: courseId },
            data: {
                students: {
                    connect: validStudentIds.map(id => ({ id }))
                }
            }
        })

        revalidatePath(`/admin/courses/${courseId}`)
        return { success: true, count: validStudentIds.length, error: undefined }
    } catch (error) {
        console.error("Error enrolling class to course:", error)
        return { success: false, count: 0, error: "Failed to enroll class" }
    }
}
