import { getHomeroomClasses } from "@/lib/actions/homeroom.actions"
import { HomeroomDashboardView } from "@/components/homeroom/homeroom-dashboard-view"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"

export const dynamic = 'force-dynamic'

export default async function HomeroomDashboard() {
    const { classes, error } = await getHomeroomClasses()

    if (error) {
        return <div className="p-8 text-red-500 bg-red-50 rounded-lg">Error: {error}</div>
    }

    return (
        <div className="space-y-6">
            <MobileHeaderSetter title="Homeroom Dashboard" subtitle="Manage your class, monitor performance, and generate reports." />

            <HomeroomDashboardView classes={classes!} />
        </div>
    )
}
