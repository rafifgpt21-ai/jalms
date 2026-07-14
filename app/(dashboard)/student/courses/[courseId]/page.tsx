import { notFound } from "next/navigation"
import { CourseOverview } from "@/components/course/course-overview"
import { getCourseWorkspace } from "@/lib/actions/course-workspace.actions"

export default async function StudentCourseOverview({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const result = await getCourseWorkspace(courseId, "student")
  if (!result.course) notFound()
  return <CourseOverview course={result.course} roleContext="student" />
}
