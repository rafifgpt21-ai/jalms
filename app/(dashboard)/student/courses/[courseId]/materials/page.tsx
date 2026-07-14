import { db } from "@/lib/db"
import { MaterialList } from "@/components/teacher/materials/material-list"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"

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
            <MobileHeaderSetter title="Study Materials" subtitle="Resources assigned to this course." />
            <MaterialList materials={materials} isTeacher={false} courseId={courseId} />
        </div>
    )
}
