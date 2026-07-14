import Link from "next/link"
import { notFound } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MaterialList } from "@/components/teacher/materials/material-list"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"
import { WorkspaceActions, WorkspacePage } from "@/components/workspace/workspace-page"
import { getTeacherMaterials } from "@/lib/actions/material.actions"
import { getCourseWorkspace } from "@/lib/actions/course-workspace.actions"

export default async function Page({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const [access, result] = await Promise.all([getCourseWorkspace(courseId, "teacher"), getTeacherMaterials()])
  if (!access.course) notFound()
  const materials = (result.materials || []).filter((material: any) => material.courseId === courseId || material.assignments?.some((assignment: any) => assignment.courseId === courseId))
  return <WorkspacePage>
    <MobileHeaderSetter title="Materials" subtitle="Resources assigned to this course." />
    <WorkspaceActions><Button size="sm" asChild><Link href="/teacher/materials/new"><Plus className="mr-2 size-4" />Add from library</Link></Button></WorkspaceActions>
    <MaterialList materials={materials} isTeacher courseId={courseId} />
  </WorkspacePage>
}
