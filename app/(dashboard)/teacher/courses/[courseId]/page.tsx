import { notFound } from "next/navigation"
import { CourseOverview } from "@/components/course/course-overview"
import { getCourseWorkspace } from "@/lib/actions/course-workspace.actions"

export default async function TeacherCourseOverview({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const result = await getCourseWorkspace(courseId, "teacher")
  if (!result.course) notFound()
  return <CourseOverview course={result.course} roleContext="teacher" />
}
