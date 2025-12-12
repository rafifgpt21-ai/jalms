import { getTeacherDashboardStats } from "@/lib/actions/teacher.actions"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"
import { TeacherDashboardView } from "@/components/teacher/dashboard/teacher-dashboard-view"

export const dynamic = 'force-dynamic'

export default async function TeacherDashboard() {
    const data = await getTeacherDashboardStats()

    if (data.error) {
        return <div className="p-6">Error loading dashboard: {data.error}</div>
    }

    const { stats, recentSubmissions, allAssignments, activeCourses, classesToday } = data

    return (
        <div className="space-y-6">
            <MobileHeaderSetter title="Teacher Dashboard" />

            <TeacherDashboardView
                stats={stats!}
                recentSubmissions={recentSubmissions!}
                allAssignments={allAssignments!}
                activeCourses={activeCourses!}
                classesToday={classesToday!}
            />
        </div>
    )
}
