import { Suspense } from "react"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"
import {
    DashboardWelcome,
    DashboardUpNext,
    DashboardSchedule,
    DashboardDeadlines,
    DashboardGrades
} from "@/components/student/dashboard/student-dashboard-components"
import {
    ScheduleSkeleton,
    DeadlinesSkeleton,
    GradesSkeleton,
    UpNextSkeleton
} from "@/components/student/dashboard/student-skeletons"
import { QuickMenu, QuickMenuSkeleton } from "@/components/student/dashboard/quick-menu"

export const dynamic = 'force-dynamic'

export default function StudentDashboard() {
    return (
        <div className="space-y-6">
            <MobileHeaderSetter title="Dashboard" />

            <Suspense fallback={<div className="h-20 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-3xl" />}>
                <DashboardWelcome />
            </Suspense>

            <Suspense fallback={<QuickMenuSkeleton />}>
                <QuickMenu />
            </Suspense>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-min">
                {/* Top Row: Up Next (2) + Grades/Stats (2) */}

                {/* Up Next Banner - Standard Skeleton */}
                <Suspense fallback={<UpNextSkeleton />}>
                    <DashboardUpNext />
                </Suspense>

                {/* Stats Row - Grades Widget combines two stats blocks */}
                <Suspense fallback={<GradesSkeleton />}>
                    <DashboardGrades />
                </Suspense>

                {/* Bottom Row: Schedule (2) + Deadlines (2) */}
                <Suspense fallback={<ScheduleSkeleton />}>
                    <DashboardSchedule />
                </Suspense>

                <Suspense fallback={<DeadlinesSkeleton />}>
                    <DashboardDeadlines />
                </Suspense>
            </div>
        </div>
    )
}
