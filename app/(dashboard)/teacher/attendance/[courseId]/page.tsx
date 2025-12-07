import { auth } from "@/auth"
import { getCourseAttendance } from "@/lib/actions/attendance.actions"
import { AttendanceForm } from "@/components/teacher/attendance/attendance-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { notFound } from "next/navigation"

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

    const { course, students, topic, error } = await getCourseAttendance(courseId, date)

    if (error || !course) {
        if (error === "Course not found") return notFound()
        return <div>Error: {error}</div>
    }

    return (
        <div className="space-y-6">
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

            <AttendanceForm
                courseId={courseId}
                date={date}
                initialStudents={students}
                initialTopic={topic}
            />
        </div>
    )
}
