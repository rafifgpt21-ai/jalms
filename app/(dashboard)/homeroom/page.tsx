import { Suspense } from "react"
import { getHomeroomClasses } from "@/lib/actions/homeroom.actions"
import { HomeroomDashboardView } from "@/components/homeroom/homeroom-dashboard-view"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"
import { GridContentSkeleton } from "@/components/navigation/route-skeletons"

export const dynamic = 'force-dynamic'

async function HomeroomContent() {
    const { classes, error } = await getHomeroomClasses()

    if (error) {
        return <div className="p-8 text-red-500 bg-red-50 rounded-lg">Error: {error}</div>
    }

    return <HomeroomDashboardView classes={classes!} />
}

export default function HomeroomDashboard() {
    return <div className="space-y-6">
        <MobileHeaderSetter title="Homeroom Dashboard" subtitle="Manage your class, monitor performance, and generate reports." />
        <Suspense fallback={<GridContentSkeleton />}><HomeroomContent /></Suspense>
    </div>
}
