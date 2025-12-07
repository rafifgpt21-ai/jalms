import { db } from "@/lib/db"
import { MaterialForm } from "@/components/teacher/materials/material-form"
import { notFound } from "next/navigation"

export default async function EditMaterialPage({
    params,
}: {
    params: Promise<{ materialId: string }>
}) {
    const { materialId } = await params

    const material = await db.material.findUnique({
        where: {
            id: materialId,
            deletedAt: { isSet: false },
        },
    })

    if (!material) {
        notFound()
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Edit Study Material</h1>
                <p className="text-sm text-muted-foreground">
                    Update the details of the study material.
                </p>
            </div>

            <MaterialForm initialData={material ? {
                id: material.id,
                title: material.title,
                description: material.description,
                fileUrl: material.fileUrl
            } : undefined} />
        </div>
    )
}
