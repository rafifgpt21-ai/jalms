"use server"

import { db as prisma } from "@/lib/db"
import { getUser } from "@/lib/actions/user.actions"
import { revalidatePath } from "next/cache"

import { unlink } from "fs/promises"
import path from "path"



export async function deleteMaterialFile(materialId: string, fileUrl: string) {
    try {
        const user = await getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        const material = await prisma.material.findUnique({
            where: { id: materialId }
        })

        if (!material || material.teacherId !== user.id) {
            return { success: false, error: "Unauthorized or material not found" }
        }

        // Extract file key from URL
        // Local File Deletion
        if (fileUrl.startsWith("/api/files/")) {
            try {
                // Remove /api/files/ prefix
                const relativePath = fileUrl.replace(/^\/api\/files\//, "")
                const fullPath = path.join(process.cwd(), "uploads", relativePath)
                // Attempt delete, ignore error if missing
                await unlink(fullPath).catch(() => { })
            } catch (error) {
                console.error("Error deleting local file:", error)
            }
        }


        await prisma.material.update({
            where: { id: materialId },
            data: { fileUrl: "" }
        })

        revalidatePath("/teacher/materials")
        return { success: true, error: undefined }
    } catch (error) {
        console.error("Error deleting material file:", error)
        return { success: false, error: "Failed to delete file" }
    }
}

export async function createMaterial(data: {
    title: string
    description?: string
    fileUrl: string
}) {
    try {
        const user = await getUser()
        if (!user || !user.id) return { success: false, material: null, error: "Unauthorized" }

        const material = await prisma.material.create({
            data: {
                title: data.title,
                description: data.description || null,
                fileUrl: data.fileUrl,
                teacherId: user.id
            }
        })

        revalidatePath("/teacher/materials")
        return { success: true, material, error: undefined }
    } catch (error) {
        console.error("Error creating material:", error)
        return { success: false, material: null, error: "Failed to create material" }
    }
}

export async function getTeacherMaterials() {
    try {
        const user = await getUser()
        if (!user) return { materials: [], error: "Unauthorized" }

        const materials = await prisma.material.findMany({
            where: {
                teacherId: user.id,
                deletedAt: { isSet: false }
            },
            include: {
                assignments: {
                    include: {
                        course: {
                            include: {
                                term: {
                                    include: {
                                        academicYear: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                uploadedAt: "desc"
            }
        })

        return { materials, error: undefined }
    } catch (error) {
        console.error("Error fetching teacher materials:", error)
        return { materials: [], error: "Failed to fetch materials" }
    }
}

export async function assignMaterialToCourse(materialId: string, courseId: string) {
    try {
        const user = await getUser()
        if (!user) return { assignment: null, error: "Unauthorized" }

        // Verify ownership
        const material = await prisma.material.findUnique({
            where: { id: materialId }
        })

        if (!material || material.teacherId !== user.id) {
            return { assignment: null, error: "Unauthorized or material not found" }
        }

        // Check if already assigned
        const existing = await prisma.materialAssignment.findFirst({
            where: {
                materialId,
                courseId
            }
        })

        if (existing) {
            return { assignment: null, error: "Material already assigned to this course" }
        }

        const assignment = await prisma.materialAssignment.create({
            data: {
                materialId,
                courseId
            }
        })

        revalidatePath("/teacher/materials")
        return { assignment, error: undefined }
    } catch (error) {
        console.error("Error assigning material:", error)
        return { assignment: null, error: "Failed to assign material" }
    }
}

export async function removeMaterialFromCourse(materialId: string, courseId: string) {
    try {
        const user = await getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        // Verify ownership
        const material = await prisma.material.findUnique({
            where: { id: materialId }
        })

        if (!material || material.teacherId !== user.id) {
            return { success: false, error: "Unauthorized or material not found" }
        }

        await prisma.materialAssignment.deleteMany({
            where: {
                materialId,
                courseId
            }
        })

        revalidatePath("/teacher/materials")
        return { success: true, error: undefined }
    } catch (error) {
        console.error("Error removing material assignment:", error)
        return { success: false, error: "Failed to remove material assignment" }
    }
}

export async function searchTeacherCourses(query: string) {
    try {
        const user = await getUser()
        if (!user) return { courses: [], error: "Unauthorized" }

        const courses = await prisma.course.findMany({
            where: {
                teacherId: user.id,
                name: { contains: query, mode: "insensitive" },
                deletedAt: { isSet: false },
                term: { isActive: true } // Only active semester
            },
            select: {
                id: true,
                name: true,
                term: {
                    select: {
                        type: true,
                        academicYear: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            take: 10
        })

        return { courses, error: undefined }
    } catch (error) {
        console.error("Error searching courses:", error)
        return { courses: [], error: "Failed to search courses" }
    }
}

export async function deleteMaterial(materialId: string) {
    try {
        const user = await getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        const material = await prisma.material.findUnique({
            where: { id: materialId }
        })

        if (!material || material.teacherId !== user.id) {
            return { success: false, error: "Unauthorized or material not found" }
        }

        // Delete associated file if it exists
        if (material.fileUrl && material.fileUrl.startsWith("/api/files/")) {
            try {
                const relativePath = material.fileUrl.replace(/^\/api\/files\//, "")
                const fullPath = path.join(process.cwd(), "uploads", relativePath)
                await unlink(fullPath).catch(() => { })
            } catch (error) {
                console.error("Error deleting local file:", error)
            }
        }

        await prisma.material.update({
            where: { id: materialId },
            data: {
                deletedAt: new Date(),
                fileUrl: "" // Clear the file URL since we deleted the file
            }
        })

        revalidatePath("/teacher/materials")
        return { success: true, error: undefined }
    } catch (error) {
        console.error("Error deleting material:", error)
        return { success: false, error: "Failed to delete material" }
    }
}

export async function updateMaterial(
    materialId: string,
    title: string,
    description: string,
    fileUrl: string
) {
    try {
        const user = await getUser()
        if (!user) return { success: false, material: null, error: "Unauthorized" }

        const material = await prisma.material.findUnique({
            where: { id: materialId }
        })

        if (!material || material.teacherId !== user.id) {
            return { success: false, material: null, error: "Unauthorized or material not found" }
        }

        const updated = await prisma.material.update({
            where: { id: materialId },
            data: {
                title,
                description,
                fileUrl
            }
        })

        revalidatePath("/teacher/materials")
        return { success: true, material: updated, error: undefined }
    } catch (error) {
        console.error("Error updating material:", error)
        return { success: false, material: null, error: "Failed to update material" }
    }
}
