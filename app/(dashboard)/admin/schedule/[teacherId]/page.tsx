import { getTeacherSchedule } from "@/lib/actions/schedule.actions"
import { db as prisma } from "@/lib/db"
import { ScheduleGrid } from "@/components/admin/schedule/schedule-grid"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function TeacherSchedulePage({
    params
}: {
    params: Promise<{ teacherId: string }>
}) {
    const { teacherId } = await params

    const teacher = await prisma.user.findUnique({
        where: { id: teacherId },
        select: { id: true, name: true, email: true }
    })

    if (!teacher) {
        notFound()
    }

    const { courses, error } = await getTeacherSchedule(teacherId)

    if (error) {
        return <div className="p-6 text-red-500">Error loading schedule: {error}</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/schedule">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Manage Schedule: {teacher.name}</h1>
                    <p className="text-gray-500">{teacher.email}</p>
                </div>
            </div>

            <ScheduleGrid teacherId={teacherId} initialCourses={courses || []} />
        </div>
    )
}
