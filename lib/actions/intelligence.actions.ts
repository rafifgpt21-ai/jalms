"use server"

import { db as prisma } from "@/lib/db"
import { IntelligenceType } from "@prisma/client"

export type IntelligenceProfile = {
    type: IntelligenceType
    score: number // Average percentage (0-100)
    count: number // Number of graded assignments
}

export async function getStudentIntelligenceProfile(studentId: string, termId?: string) {
    try {
        // Fetch all graded submissions
        const submissions = await prisma.submission.findMany({
            where: {
                studentId,
                grade: { not: null },
                deletedAt: { isSet: false },
                assignment: {
                    deletedAt: { isSet: false },
                    course: {
                        deletedAt: { isSet: false },
                        ...(termId ? { termId } : {})
                    }
                }
            },
            include: {
                assignment: {
                    include: {
                        course: {
                            include: {
                                subject: true // Need subject for fallback tags
                            }
                        }
                    }
                }
            }
        })

        // Accumulators
        const intelligenceScores: Record<string, { total: number; count: number }> = {}

        // Initialize for all types to ensure consistent return structure (optional, but good for charts)
        Object.values(IntelligenceType).forEach(type => {
            intelligenceScores[type] = { total: 0, count: 0 }
        })

        for (const sub of submissions) {
            const assignment = sub.assignment
            const grade = sub.grade || 0 // Should be not null due to WHERE clause

            // Determine effective tags
            let tags: IntelligenceType[] = []

            if (assignment.intelligenceTypes && assignment.intelligenceTypes.length > 0) {
                // Formatting Check: Prisma returns enum array, so this is straightforward
                tags = assignment.intelligenceTypes
            } else if (assignment.course.subject?.intelligenceTypes && assignment.course.subject.intelligenceTypes.length > 0) {
                // Fallback to Subject tags
                tags = assignment.course.subject.intelligenceTypes
            }
            // Logic note: If both are empty, this assignment contributes to NO intelligence type.

            // Distribute score to each tag
            tags.forEach(tag => {
                intelligenceScores[tag].total += grade
                intelligenceScores[tag].count += 1
            })
        }

        // Calculate averages
        const profile: IntelligenceProfile[] = Object.entries(intelligenceScores).map(([type, data]) => ({
            type: type as IntelligenceType,
            score: data.count > 0 ? Math.round(data.total / data.count) : 0,
            count: data.count
        })).sort((a, b) => b.score - a.score) // Sort by highest score

        return { profile }

    } catch (error) {
        console.error("Error calculating intelligence profile:", error)
        return { error: "Failed to calculate profile" }
    }
}
