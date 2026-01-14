import { getTeachersWithCourses } from "@/lib/actions/teacher.actions"
import { MasterScheduleManager } from "@/components/admin/schedule/master-schedule-manager"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"

export const dynamic = "force-dynamic"

export default async function SchedulePage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string }>
}) {
    const params = await searchParams
    const { teachers, error } = await getTeachersWithCourses(params.search)

    if (error) {
        return <div className="p-6 text-red-500">Error loading schedule: {error}</div>
    }

    return (
        <div className="space-y-6 h-full flex flex-col">
            <MobileHeaderSetter title="Schedule Manager" />
            <MasterScheduleManager teachers={(teachers as any) || []} />
        </div>
    )
}
