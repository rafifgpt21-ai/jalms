"use server"

import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getClasses() {
    try {
        const classes = await prisma.class.findMany({
            where: {
                deletedAt: { isSet: false },
            },
            include: {
                term: {
                    include: { academicYear: true }
                },
                homeroomTeacher: true,
                _count: {
                    select: { students: true }
                }
            },
            orderBy: [
                { term: { startDate: "desc" } },
                { name: "asc" }
            ],
        })

        return { classes, error: null }
    } catch (error) {
        console.error("Error fetching classes:", error)
        return { classes: [], error: "Failed to fetch classes" }
    }
}

export async function createClass(data: {
    name: string;
    termId: string;
    homeroomTeacherId?: string;
}) {
    try {
        // Check for duplicate name in same term
        const existing = await prisma.class.findFirst({
            where: {
                name: data.name,
                termId: data.termId,
                // deletedAt filter removed
            }
        })

        if (existing) {
            return { error: "Class name already exists in this semester" }
        }

        const newClass = await prisma.class.create({
            data: {
                name: data.name,
                termId: data.termId,
                homeroomTeacherId: data.homeroomTeacherId || null,
            }
        })

        revalidatePath("/admin/classes")
        return { success: true, class: newClass }
    } catch (error) {
        console.error("Error creating class:", error)
        return { error: "Failed to create class" }
    }
}

export async function updateClass(id: string, data: {
    name: string;
    homeroomTeacherId?: string;
}) {
    try {
        await prisma.class.update({
            where: { id },
            data: {
                name: data.name,
                homeroomTeacherId: data.homeroomTeacherId || null,
            }
        })

        revalidatePath("/admin/classes")
        return { success: true }
    } catch (error) {
        console.error("Error updating class:", error)
        return { error: "Failed to update class" }
    }
}

export async function deleteClass(id: string) {
    try {
        await prisma.class.update({
            where: { id },
            data: { deletedAt: new Date() }
        })

        revalidatePath("/admin/classes")
        return { success: true }
    } catch (error) {
        console.error("Error deleting class:", error)
        return { error: "Failed to delete class" }
    }
}

// Helper to get potential homeroom teachers
export async function getHomeroomTeachers() {
    try {
        const teachers = await prisma.user.findMany({
            where: {
                roles: {
                    has: "HOMEROOM_TEACHER"
                },
                isActive: true
                // deletedAt filter removed
            },
            select: {
                id: true,
                name: true,
            }
        })
        return { teachers, error: null }
    } catch (error) {
        console.error("Error fetching teachers:", error)
        return { teachers: [], error: "Failed to fetch teachers" }
    }
}

// Helper to get active terms for dropdown
export async function getActiveTerms(includeTermId?: string) {
    try {
        const where: any = {
            deletedAt: { isSet: false }
        }

        if (includeTermId) {
            // If we need to include a specific term (even if deleted), we change the query
            // OR logic: deletedAt is null OR id is includeTermId
            where.OR = [
                { deletedAt: { isSet: false } },
                { id: includeTermId }
            ]
            delete where.deletedAt
        }

        const terms = await prisma.term.findMany({
            where,
            include: { academicYear: true },
            orderBy: { startDate: "desc" }
        })
        return { terms, error: null }
    } catch (error) {
        console.error("Error fetching terms:", error)
        return { terms: [], error: "Failed to fetch terms" }
    }
}

export async function getAvailableClassesForDropdown(search: string = "", activeSemesterOnly: boolean = true) {
    try {
        const where: any = {
            // deletedAt: { isSet: false } // Removed due to potential issues, relying on logic
        }

        if (search) {
            where.name = { contains: search, mode: "insensitive" }
        }

        if (activeSemesterOnly) {
            // Find active terms first
            const activeTerms = await prisma.term.findMany({
                where: { isActive: true },
                select: { id: true }
            })
            const activeTermIds = activeTerms.map(t => t.id)
            where.termId = { in: activeTermIds }
        }

        const classes = await prisma.class.findMany({
            where,
            take: 10,
            orderBy: { name: "asc" },
            include: {
                term: {
                    include: { academicYear: true }
                },
                _count: {
                    select: { students: true }
                }
            }
        })

        return { classes }
    } catch (error) {
        console.error("Error fetching classes for dropdown:", error)
        return { classes: [] }
    }
}
