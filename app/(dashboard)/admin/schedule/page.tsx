import { getTeachersWithCourses } from "@/lib/actions/teacher.actions"
import { TeacherScheduleList } from "@/components/admin/schedule/teacher-schedule-list"
import { ScheduleSearch } from "@/components/admin/schedule/schedule-search"

export const dynamic = "force-dynamic"

export default async function SchedulePage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string }>
}) {
    const params = await searchParams
    console.log("SchedulePage searchParams:", params)
    const { teachers, error } = await getTeachersWithCourses(params.search)

    if (error) {
        return <div className="p-6 text-red-500">Error loading schedule: {error}</div>
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Schedule Manager</h1>
                    <p className="text-gray-500">View all teachers and their assigned courses.</p>
                </div>
                <ScheduleSearch />
            </div>

            <TeacherScheduleList teachers={teachers || []} />
        </div>
    )
}
