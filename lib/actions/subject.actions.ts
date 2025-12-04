"use server"

import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getSubjects() {
    try {
        const subjects = await prisma.subject.findMany({
            where: { deletedAt: null },
            orderBy: { name: "asc" }
        })
        return { subjects }
    } catch (error) {
        console.error("Error fetching subjects:", error)
        return { subjects: [] }
    }
}

export async function createSubject(data: { name: string; code: string; description?: string }) {
    try {
        const subject = await prisma.subject.create({
            data
        })
        revalidatePath("/admin/courses")
        return { success: true, subject }
    } catch (error) {
        console.error("Error creating subject:", error)
        return { error: "Failed to create subject" }
    }
}
