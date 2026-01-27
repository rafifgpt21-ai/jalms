"use server"

import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getCourses(options: { showAll?: boolean } = {}) {
    try {
        const activeTerm = await prisma.term.findFirst({
            where: { isActive: true, deletedAt: { isSet: false } }
        })

        const whereClause: any = {
            deletedAt: { isSet: false },
        }

        if (!options.showAll) {
            if (!activeTerm) {
                return { courses: [] }
            }
            whereClause.termId = activeTerm.id
        }

        const courses = await prisma.course.findMany({
            where: whereClause,
            include: {
                teacher: true,
                term: {
                    include: { academicYear: true }
                },
                subject: true,
                _count: {
                    select: { students: true }
                }
            },
            orderBy: {
                name: "asc"
            }
        })

        const coursesWithCount = courses.map(course => ({
            ...course,
            _count: { students: course.studentIds.length }
        }))

        return { courses: coursesWithCount }
    } catch (error) {
        console.error("Error fetching courses:", error)
        return { courses: [] }
    }
}

export async function getCourse(id: string) {
    try {
        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                teacher: true,
                term: {
                    include: { academicYear: true }
                },
                subject: true,
                students: true
            }
        })
        return { course }
    } catch (error) {
        console.error("Error fetching course:", error)
        return { error: "Failed to fetch course" }
    }
}

export async function createCourse(data: { name: string; reportName?: string; teacherId: string; termId: string; subjectId?: string }) {
    try {
        const course = await prisma.course.create({
            data: {
                name: data.name,
                reportName: data.reportName,
                teacherId: data.teacherId,
                termId: data.termId,
                subjectId: data.subjectId || null
            }
        })

        revalidatePath("/admin/courses")
        return { success: true, course }
    } catch (error) {
        console.error("Error creating course:", error)
        return { error: "Failed to create course" }
    }
}

export async function updateCourse(id: string, data: { name: string; reportName?: string; teacherId: string; termId: string; subjectId?: string }) {
    try {
        await prisma.course.update({
            where: { id },
            data: {
                name: data.name,
                reportName: data.reportName,
                teacherId: data.teacherId,
                termId: data.termId,
                subjectId: data.subjectId || null
            }
        })

        revalidatePath("/admin/courses")
        return { success: true }
    } catch (error) {
        console.error("Error updating course:", error)
        return { error: "Failed to update course" }
    }
}

export async function deleteCourse(id: string) {
    try {
        await prisma.course.update({
            where: { id },
            data: { deletedAt: new Date() }
        })
        revalidatePath("/admin/courses")
        return { success: true }
    } catch (error) {
        console.error("Error deleting course:", error)
        return { error: "Failed to delete course" }
    }
}
