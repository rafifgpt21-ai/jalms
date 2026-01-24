import {
    getTeacherStats,
    getClassesToday,
    getAssignmentsOverview,
    getRecentSubmissions
} from "@/lib/actions/teacher.actions"
import {
    StatsSection,
    ClassesSection,
    AssignmentsWidget,
    RecentSubmissionsSection
} from "@/components/teacher/dashboard/teacher-dashboard-view"

export async function DashboardStats() {
    const { stats, error } = await getTeacherStats()
    if (error || !stats) return <div className="p-6 text-red-500">Failed to load stats</div>

    return <StatsSection stats={stats} />
}

export async function ClassesTodayCard() {
    const { classesToday, error } = await getClassesToday()
    if (error || !classesToday) return <div className="p-6 text-red-500">Failed to load classes</div>

    return <ClassesSection classesToday={classesToday} />
}

export async function AssignmentsWidgetWrapper() {
    const { allAssignments, activeCourses, error } = await getAssignmentsOverview()
    if (error || !allAssignments || !activeCourses) return <div className="p-6 text-red-500">Failed to load assignments</div>

    return <AssignmentsWidget allAssignments={allAssignments} activeCourses={activeCourses} />
}

export async function RecentSubmissionsList() {
    const { recentSubmissions, error } = await getRecentSubmissions()
    if (error || !recentSubmissions) return <div className="p-6 text-red-500">Failed to load submissions</div>

    return <RecentSubmissionsSection recentSubmissions={recentSubmissions} />
}
