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
            <MobileHeaderSetter title="Homeroom Dashboard" />

            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold font-heading text-slate-900 dark:text-slate-100">Homeroom Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400">Manage your class, monitor student performance, and generate reports.</p>
            </div>

            <HomeroomDashboardView classes={classes!} />
        </div>
    )
}
