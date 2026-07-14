import { getTeacherMaterials } from "@/lib/actions/material.actions"
import { MaterialList } from "@/components/teacher/materials/material-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"
import { WorkspaceActions } from "@/components/workspace/workspace-page"

export const dynamic = 'force-dynamic'

export default async function TeacherMaterialsPage() {
    const { materials, error } = await getTeacherMaterials()

    if (error) {
        return <div>Error loading materials</div>
    }

    return (
        <div className="space-y-6">
            <MobileHeaderSetter title="Study Materials" subtitle="Create and manage reusable course resources." />
            <WorkspaceActions>
                <Button asChild>
                    <Link href="/teacher/materials/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Material
                    </Link>
                </Button>
            </WorkspaceActions>

            <MaterialList materials={materials || []} isTeacher={true} />
        </div>
    )
}
