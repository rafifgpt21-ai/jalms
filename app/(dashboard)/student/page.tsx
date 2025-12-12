import { getStudentDashboardStats } from "@/lib/actions/student.actions"
import { getUser } from "@/lib/actions/user.actions"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"
import { StudentDashboardView } from "@/components/student/dashboard/student-dashboard-view"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function StudentDashboard() {
    const user = await getUser()

    if (!user) {
        redirect("/sign-in")
    }

    const stats = await getStudentDashboardStats()

    if ('error' in stats) {
        return <div className="p-10 text-center text-red-500">Error loading dashboard stats</div>
    }

    const { schedule, upcomingDeadlines, recentGrades } = stats

    return (
        <div className="space-y-6">
            <MobileHeaderSetter title="Dashboard" />

            <StudentDashboardView
                user={user}
                schedule={schedule}
                upcomingDeadlines={upcomingDeadlines}
                recentGrades={recentGrades}
            />
        </div>
    )
}
