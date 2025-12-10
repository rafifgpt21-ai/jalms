import { getTeachersWithCourses } from "@/lib/actions/teacher.actions"
import { TeacherScheduleList } from "@/components/admin/schedule/teacher-schedule-list"
import { ScheduleSearch } from "@/components/admin/schedule/schedule-search"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"

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
        <div className="space-y-6">
            <MobileHeaderSetter title="Schedule Manager" />
            <div className="flex items-center gap-2">
                <ScheduleSearch />
                <div className="ml-auto">
                    <a href="/admin/schedule/overview" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                        View Master Timetable
                    </a>
                </div>
            </div>

            <TeacherScheduleList teachers={teachers || []} />
        </div>
    )
}
