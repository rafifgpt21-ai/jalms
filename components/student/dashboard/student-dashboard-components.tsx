import {
    getStudentSchedule,
    getStudentAssignments,
    getRecentGrades
} from "@/lib/actions/student.actions"
import { getUser } from "@/lib/actions/user.actions"
import {
    StudentWelcome,
    StudentUpNextCard,
    StudentScheduleCard,
    StudentDeadlinesWidget,
    StudentGradesWidget
} from "@/components/student/dashboard/student-dashboard-view"

export async function DashboardWelcome() {
    const user = await getUser()
    if (!user) return null
    return <StudentWelcome user={user} />
}

export async function DashboardUpNext() {
    const { schedule, error } = await getStudentSchedule()
    if (error || !schedule) return <div className="p-6 text-red-500">Failed to load schedule</div>
    return <StudentUpNextCard schedule={schedule} />
}

export async function DashboardSchedule() {
    const { schedule, error } = await getStudentSchedule()
    if (error || !schedule) return <div className="p-6 text-red-500">Failed to load schedule</div>
    return <StudentScheduleCard schedule={schedule} />
}

export async function DashboardDeadlines() {
    const { upcomingDeadlines, error } = await getStudentAssignments()
    if (error || !upcomingDeadlines) return <div className="p-6 text-red-500">Failed to load deadlines</div>
    return <StudentDeadlinesWidget upcomingDeadlines={upcomingDeadlines} />
}

export async function DashboardGrades() {
    const { recentGrades, error } = await getRecentGrades()
    const { upcomingDeadlines } = await getStudentAssignments()

    if (error || !recentGrades) return <div className="p-6 text-red-500">Failed to load grades</div>
    return <StudentGradesWidget recentGrades={recentGrades} deadlinesCount={upcomingDeadlines?.length || 0} />
}
