import { auth } from "@/auth"
import { getCourseAttendance } from "@/lib/actions/attendance.actions"
import { AttendanceForm } from "@/components/teacher/attendance/attendance-form"
import { format } from "date-fns"
import { notFound } from "next/navigation"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"

export default async function CourseAttendancePage({
    params,
    searchParams,
}: {
    params: Promise<{ courseId: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await auth()
    if (!session?.user?.id) return <div>Not authenticated</div>

    const { courseId } = await params
    const resolvedSearchParams = await searchParams
    const dateParam = typeof resolvedSearchParams.date === 'string' ? resolvedSearchParams.date : undefined
    const date = dateParam ? new Date(dateParam) : new Date()
    const periodParam = resolvedSearchParams.period
    const period = typeof periodParam === 'string' ? parseInt(periodParam) : 1

    const { course, students, topic, error } = await getCourseAttendance(courseId, date, period)

    if (error || !course) {
        if (error === "Course not found") return notFound()
        return <div>Error: {error}</div>
    }

    return (
        <div className="space-y-6">
            <MobileHeaderSetter
                title={`${course.name} attendance`}
                subtitle={`${course.class?.name || "Course"} · ${format(date, "MMM d, yyyy")}`}
            />

            <AttendanceForm
                courseId={courseId}
                date={date}
                period={period}
                initialStudents={students}
                initialTopic={topic || ""}
            />
        </div>
    )
}
