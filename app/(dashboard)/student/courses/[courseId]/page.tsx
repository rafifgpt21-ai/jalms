import { Suspense } from "react"
import { notFound } from "next/navigation"
import { CourseOverview } from "@/components/course/course-overview"
import { getCourseWorkspace } from "@/lib/actions/course-workspace.actions"
import { CourseRouteSkeleton } from "@/components/navigation/route-skeletons"

async function StudentCourseContent({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const result = await getCourseWorkspace(courseId, "student")
  if (!result.course) notFound()
  return <CourseOverview course={result.course} roleContext="student" />
}

export default function StudentCourseOverview({ params }: { params: Promise<{ courseId: string }> }) {
  return <Suspense fallback={<CourseRouteSkeleton />}><StudentCourseContent params={params} /></Suspense>
}
