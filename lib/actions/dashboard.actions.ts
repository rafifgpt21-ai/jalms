"use server"

import { db as prisma } from "@/lib/db"

export async function getDashboardStats() {
    try {
        const [
            studentCount,
            teacherCount,
            classCount,
            activeCourseCount,
            recentUsers
        ] = await Promise.all([
            prisma.user.count({
                where: {
                    roles: { has: "STUDENT" },
                    deletedAt: { isSet: false },
                    isActive: true
                }
            }),
            prisma.user.count({
                where: {
                    roles: { hasSome: ["SUBJECT_TEACHER", "HOMEROOM_TEACHER"] },
                    deletedAt: { isSet: false },
                    isActive: true
                }
            }),
            prisma.class.count({
                where: {
                    deletedAt: { isSet: false }
                }
            }),
            prisma.course.count({
                where: {
                    deletedAt: { isSet: false },
                    term: { isActive: true }
                }
            }),
            prisma.user.findMany({
                where: { deletedAt: { isSet: false } },
                orderBy: { createdAt: "desc" },
                take: 5,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    roles: true,
                    createdAt: true,
                    image: true
                }
            })
        ])

        return {
            stats: {
                students: studentCount,
                teachers: teacherCount,
                classes: classCount,
                courses: activeCourseCount
            },
            recentUsers
        }
    } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        return { error: "Failed to load dashboard statistics" }
    }
}
