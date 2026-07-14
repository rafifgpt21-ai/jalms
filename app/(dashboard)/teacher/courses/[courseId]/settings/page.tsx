import { notFound } from "next/navigation"
import { CourseCompetencySettings } from "@/components/teacher/course-competency-settings"
import { CourseIdentitySettings } from "@/components/teacher/course-identity-settings"
import { WorkspaceHeader, WorkspacePage, WorkspacePanel } from "@/components/workspace/workspace-page"
import { getCourseWorkspace } from "@/lib/actions/course-workspace.actions"

export default async function CourseSettingsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const result = await getCourseWorkspace(courseId, "teacher")
  if (!result.course) notFound()
  return <WorkspacePage>
    <WorkspaceHeader><h1 className="text-xl font-semibold">Course settings</h1><p className="text-sm text-muted-foreground">Identity, relationships, enrollment, and grading behavior.</p></WorkspaceHeader>
    <WorkspacePanel className="p-4"><CourseIdentitySettings course={result.course} /></WorkspacePanel>
    <div className="max-w-4xl"><CourseCompetencySettings courseId={courseId} /></div>
  </WorkspacePage>
}
