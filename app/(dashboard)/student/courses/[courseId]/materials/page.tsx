import { db } from "@/lib/db"
import { MaterialList } from "@/components/teacher/materials/material-list"

export default async function StudentCourseMaterialsPage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = await params
    const materials = await db.material.findMany({
        where: {
            assignments: {
                some: {
                    courseId: courseId
                }
            },
            deletedAt: { isSet: false }
        },
        orderBy: {
            uploadedAt: 'desc'
        }
    })

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Study Materials</h1>
            <MaterialList materials={materials} isTeacher={false} courseId={courseId} />
        </div>
    )
}
