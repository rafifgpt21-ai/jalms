import { getStudentDashboardStats } from "@/lib/actions/student.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPeriodLabel } from "@/lib/helpers/period-label"
import { Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"

export const dynamic = 'force-dynamic'

export default async function StudentDashboard() {
    const stats = await getStudentDashboardStats()

    if ('error' in stats) {
        return <div>Error loading dashboard</div>
    }

    const { schedule, upcomingDeadlines, recentGrades } = stats

    return (
        <div className="space-y-6">
            <MobileHeaderSetter title="Student Dashboard" />
            <h1 className="text-3xl font-bold">Student Dashboard</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Today's Schedule */}
                <Card className="col-span-1 md:col-span-2 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Today's Schedule
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {schedule && schedule.length > 0 ? (
                            <div className="space-y-4">
                                {schedule.map((slot: any) => (
                                    <div key={slot.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                                        <div>
                                            <div className="font-semibold">{slot.course.reportName || slot.course.name}</div>
                                            <div className="text-sm text-gray-500">{getPeriodLabel(slot.period)}</div>
                                            {slot.topic && (
                                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                                                    {slot.topic}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-sm font-medium text-blue-600">
                                            {slot.course.teacher.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No classes scheduled for today.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Upcoming Deadlines */}
                <Card className="col-span-1 md:col-span-1 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Upcoming Deadlines
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
                            <div className="space-y-4">
                                {upcomingDeadlines.map((assignment: any) => {
                                    const submission = assignment.submissions[0]
                                    const isSubmitted = !!submission
                                    const isOverdue = !isSubmitted && new Date(assignment.dueDate) < new Date()
                                    const isLate = isSubmitted && new Date(submission.submittedAt) > new Date(assignment.dueDate)

                                    return (
                                        <Link
                                            key={assignment.id}
                                            href={`/student/courses/${assignment.courseId}/tasks/${assignment.id}`}
                                            className={`block p-3 rounded-lg border transition-colors ${isSubmitted
                                                ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900 hover:border-green-300"
                                                : "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900 hover:border-yellow-300"
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="font-semibold truncate flex-1 mr-2">{assignment.title}</div>
                                                <div className="flex gap-1 shrink-0">
                                                    {isSubmitted && (
                                                        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full dark:bg-green-900 dark:text-green-300">
                                                            Submitted
                                                        </span>
                                                    )}
                                                    {isLate && (
                                                        <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full dark:bg-orange-900 dark:text-orange-300">
                                                            Late
                                                        </span>
                                                    )}
                                                    {isOverdue && (
                                                        <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full dark:bg-red-900 dark:text-red-300">
                                                            Overdue
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">{assignment.course.reportName || assignment.course.name}</span>
                                                <span className={`font-medium ${isOverdue ? "text-red-600" : "text-gray-600"}`}>
                                                    {format(new Date(assignment.dueDate), "MMM d, h:mm a")}
                                                </span>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-500">No upcoming deadlines.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Activity / Grades */}
                <Card className="col-span-1 md:col-span-1 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            Recent Grades
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentGrades && recentGrades.length > 0 ? (
                            <div className="space-y-4">
                                {recentGrades.map((submission: any) => (
                                    <div key={submission.id} className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                                        <div className="font-semibold truncate">{submission.assignment.title}</div>
                                        <div className="flex justify-between text-sm mt-1">
                                            <span className="text-gray-500">{submission.assignment.course.reportName || submission.assignment.course.name}</span>
                                            <span className="font-bold text-green-600">
                                                {submission.grade} / {submission.assignment.maxPoints}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No recent grades.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
