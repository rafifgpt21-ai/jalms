import { getMasterSchedule } from "@/lib/actions/schedule.actions"
import { MasterScheduleView } from "@/components/admin/schedule/master-schedule-view"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"

export const dynamic = "force-dynamic"

export default async function MasterSchedulePage() {
    const { schedules, error } = await getMasterSchedule()

    if (error) {
        return <div className="p-6 text-red-500">Error loading master schedule: {error}</div>
    }

    return (
        <div className="space-y-6">
            <MobileHeaderSetter title="Overview Calendar" />

            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Overview Calendar</h1>
                <p className="text-muted-foreground">View all teacher schedules at a glance.</p>
            </div>

            <MasterScheduleView schedules={schedules || []} />
        </div>
    )
}
