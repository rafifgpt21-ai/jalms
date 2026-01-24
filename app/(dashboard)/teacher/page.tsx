import { Suspense } from "react"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"
import {
    DashboardStats,
    ClassesTodayCard,
    AssignmentsWidgetWrapper,
    RecentSubmissionsList
} from "@/components/teacher/dashboard/dashboard-components"
import {
    StatsSkeleton,
    ClassesSkeleton,
    AssignmentsSkeleton,
    RecentSubmissionsSkeleton
} from "@/components/teacher/dashboard/skeletons"

export const dynamic = 'force-dynamic'

export default function TeacherDashboard() {
    return (
        <div className="space-y-6">
            <MobileHeaderSetter title="Teacher Dashboard" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-10">
                {/* Stats Row */}
                <Suspense fallback={<StatsSkeleton />}>
                    <DashboardStats />
                </Suspense>

                {/* Left Column: Classes & Assignments (Span 3) */}
                <div className="lg:col-span-3 space-y-6">
                    <Suspense fallback={<ClassesSkeleton />}>
                        <ClassesTodayCard />
                    </Suspense>

                    <Suspense fallback={<AssignmentsSkeleton />}>
                        <AssignmentsWidgetWrapper />
                    </Suspense>
                </div>

                {/* Right Column: Recent Submissions (Span 1) */}
                <Suspense fallback={<RecentSubmissionsSkeleton />}>
                    <RecentSubmissionsList />
                </Suspense>
            </div>
        </div>
    )
}
