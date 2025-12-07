"use server"

import { db as prisma } from "@/lib/db"

export async function getDashboardStats() {
    try {
        const [
            totalUsers,
            lastLoggedInUsers
        ] = await Promise.all([
            prisma.user.count({
                where: {
                    deletedAt: { isSet: false },
                    isActive: true
                }
            }),
            prisma.user.findMany({
                where: {
                    deletedAt: { isSet: false },
                    lastLoginAt: { not: null }
                },
                orderBy: { lastLoginAt: "desc" },
                take: 5,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    roles: true,
                    lastLoginAt: true,
                    image: true
                }
            })
        ])

        // Calculate Attendance Stats for Today
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const todayAttendances = await prisma.attendance.findMany({
            where: {
                date: {
                    gte: today,
                    lt: tomorrow
                },
                deletedAt: { isSet: false }
            }
        })

        const totalRecords = todayAttendances.length
        const totalPresent = todayAttendances.filter(a => a.status === "PRESENT").length
        const percentage = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0

        return {
            stats: {
                totalUsers,
                attendance: {
                    percentage,
                    totalRecords,
                    presentCount: totalPresent,
                    absentCount: totalRecords - totalPresent
                }
            },
            lastLoggedInUsers
        }
    } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        return { error: "Failed to load dashboard statistics" }
    }
}
