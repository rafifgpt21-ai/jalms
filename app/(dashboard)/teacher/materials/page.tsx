import { getTeacherMaterials } from "@/lib/actions/material.actions"
import { MaterialList } from "@/components/teacher/materials/material-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function TeacherMaterialsPage() {
    const { materials, error } = await getTeacherMaterials()

    if (error) {
        return <div>Error loading materials</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">My Study Materials</h1>
                <Button asChild>
                    <Link href="/teacher/materials/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Material
                    </Link>
                </Button>
            </div>

            <MaterialList materials={materials || []} isTeacher={true} />
        </div>
    )
}
