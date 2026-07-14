import { Suspense } from "react"
import { notFound } from "next/navigation"
import { CourseOverview } from "@/components/course/course-overview"
import { getCourseWorkspace } from "@/lib/actions/course-workspace.actions"
import { CourseRouteSkeleton } from "@/components/navigation/route-skeletons"

async function TeacherCourseContent({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const result = await getCourseWorkspace(courseId, "teacher")
  if (!result.course) notFound()
  return <CourseOverview course={result.course} roleContext="teacher" />
}

export default function TeacherCourseOverview({ params }: { params: Promise<{ courseId: string }> }) {
  return <Suspense fallback={<CourseRouteSkeleton />}><TeacherCourseContent params={params} /></Suspense>
}
