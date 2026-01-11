"use server"

import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { AcademicDomain } from "@prisma/client"

export async function getSubjects() {
    try {
        const subjects = await prisma.subject.findMany({
            where: {
                OR: [
                    { deletedAt: { isSet: false } },
                    { deletedAt: null }
                ]
            },
            orderBy: { name: "asc" }
        })
        return { subjects }
    } catch (error) {
        console.error("Error fetching subjects:", error)
        return { subjects: [] }
    }
}

export async function createSubject(data: {
    name: string;
    code: string;
    description?: string;
    academicDomains: AcademicDomain[]
}) {
    try {
        const subject = await prisma.subject.create({
            data: {
                name: data.name,
                code: data.code,
                description: data.description,
                academicDomains: data.academicDomains
            }
        })
        revalidatePath("/admin/subjects")
        revalidatePath("/admin/courses")
        return { success: true, subject }
    } catch (error) {
        console.error("Error creating subject:", error)
        return { error: "Failed to create subject" }
    }
}

export async function updateSubject(
    id: string,
    data: {
        name: string;
        code: string;
        description?: string;
        academicDomains: AcademicDomain[]
    }
) {
    try {
        const subject = await prisma.subject.update({
            where: { id },
            data: {
                name: data.name,
                code: data.code,
                description: data.description,
                academicDomains: data.academicDomains
            }
        })
        revalidatePath("/admin/subjects")
        return { success: true, subject }
    } catch (error) {
        console.error("Error updating subject:", error)
        return { error: "Failed to update subject" }
    }
}

export async function deleteSubject(id: string) {
    try {
        // Soft delete
        await prisma.subject.update({
            where: { id },
            data: { deletedAt: new Date() }
        })
        revalidatePath("/admin/subjects")
        return { success: true }
    } catch (error) {
        console.error("Error deleting subject:", error)
        return { error: "Failed to delete subject" }
    }
}
