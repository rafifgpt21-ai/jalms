"use client"

import { MaterialCard } from "./material-card"

interface MaterialListProps {
    materials: any[]
    isTeacher?: boolean
    courseId?: string
}

export function MaterialList({ materials, isTeacher = false, courseId }: MaterialListProps) {
    if (materials.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No materials yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {isTeacher
                        ? "Upload study materials to share with your students."
                        : "No study materials have been uploaded for this course yet."}
                </p>
            </div>
        )
    }

    return (
        <div className="grid gap-4">
            {materials.map((material) => (
                <MaterialCard key={material.id} material={material} isTeacher={isTeacher} courseId={courseId} />
            ))}
        </div>
    )
}
