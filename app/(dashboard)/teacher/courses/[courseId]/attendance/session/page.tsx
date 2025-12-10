import { auth } from "@/auth"
import { getCourseAttendance } from "@/lib/actions/attendance.actions"
import { AttendanceForm } from "@/components/teacher/attendance/attendance-form"
import { Badge } from "@/components/ui/badge"
import { getPeriodLabel } from "@/lib/helpers/period-label"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { notFound } from "next/navigation"

export default async function CourseAttendanceSessionPage({
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
    const periodParam = typeof resolvedSearchParams.period === 'string' ? resolvedSearchParams.period : "1"
    const period = parseInt(periodParam)

    const { course, students, topic, error } = await getCourseAttendance(courseId, date, period)

    if (error || !course) {
        if (error === "Course not found") return notFound()
        return <div>Error: {error}</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight">Attendance Session</h1>
                    <Badge variant="outline">{getPeriodLabel(period)}</Badge>
                </div>
                <div className="flex items-center gap-4">
                    <Link href={`/teacher/attendance?date=${format(date, "yyyy-MM-dd")}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{course.name}</h1>
                        <p className="text-muted-foreground">
                            {course.class?.name} • {format(date, "EEEE, MMMM d, yyyy")}
                        </p>
                    </div>
                </div>
            </div>

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
