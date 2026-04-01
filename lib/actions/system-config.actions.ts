"use server"

import { db as prisma } from "@/lib/db"
import { getUser } from "@/lib/actions/user.actions"
import { revalidatePath } from "next/cache"

const GRADING_SCALE_KEY = "grading_scale"

export interface GradingScale {
    grade: string // "A", "B", "C", "D", "E"
    min: number
    max: number
}

export async function getGradingScaleDefaults() {
    try {
        const user = await getUser()
        // Allow teachers to read it too for their course settings
        if (!user) return { error: "Unauthorized" }

        const config = await prisma.systemConfig.findUnique({
            where: { id: GRADING_SCALE_KEY }
        })

        if (!config?.value) {
            // Default Values if not set
            return {
                scale: [
                    { grade: "A", min: 90, max: 100 },
                    { grade: "B", min: 80, max: 89 },
                    { grade: "C", min: 70, max: 79 },
                    { grade: "D", min: 60, max: 69 },
                    { grade: "E", min: 0, max: 59 },
                ] as GradingScale[]
            }
        }

        return { scale: config.value as unknown as GradingScale[] }

    } catch (error) {
        console.error("Error fetching grading scale:", error)
        return { error: "Failed to fetch grading scale" }
    }
}

export async function updateGradingScaleDefaults(scale: GradingScale[]) {
    try {
        const user = await getUser()
        if (!user || !user.roles.includes("ADMIN")) return { error: "Unauthorized" }

        await prisma.systemConfig.upsert({
            where: { id: GRADING_SCALE_KEY },
            update: { value: scale as any },
            create: { id: GRADING_SCALE_KEY, value: scale as any }
        })

        revalidatePath("/admin/grading")
        return { success: true }
    } catch (error) {
        console.error("Error updating grading scale:", error)
        return { error: "Failed to update grading scale" }
    }

}

const PRINCIPAL_NAME_KEY = "principal_name"

export async function getPrincipalName() {
    try {
        const config = await prisma.systemConfig.findUnique({
            where: { id: PRINCIPAL_NAME_KEY }
        })
        return config?.value ? (config.value as { name: string }).name : ""
    } catch (error) {
        return ""
    }
}

export async function updatePrincipalName(name: string) {
    try {
        const user = await getUser()
        // Allow teachers and admins to update this
        if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("HOMEROOM_TEACHER"))) {
            return { error: "Unauthorized" }
        }

        await prisma.systemConfig.upsert({
            where: { id: PRINCIPAL_NAME_KEY },
            update: { value: { name } },
            create: { id: PRINCIPAL_NAME_KEY, value: { name } }
        })

        return { success: true }
    } catch (error) {
        console.error("Error updating principal name:", error)
        return { error: "Failed to update principal name" }
    }
}
