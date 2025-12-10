import { getTeacherDashboardStats } from "@/lib/actions/teacher.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, FileText, Clock, CheckCircle, Plus, Calendar } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { getPeriodLabel } from "@/lib/helpers/period-label"
import { Button } from "@/components/ui/button"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"

export const dynamic = 'force-dynamic'

export default async function TeacherDashboard() {
    const data = await getTeacherDashboardStats()

    if (data.error) {
        return <div className="p-6">Error loading dashboard: {data.error}</div>
    }

    const { stats, recentSubmissions, upcomingAssignments, classesToday } = data

    return (
        <div className="space-y-6">
            <MobileHeaderSetter title="Teacher Dashboard" />
            {/* Classes Today Widget */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-100 dark:border-blue-900">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                        <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                        Classes Today
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {classesToday?.length === 0 && (
                            <p className="text-sm text-muted-foreground py-4">No classes scheduled for today.</p>
                        )}
                        {classesToday?.map((schedule: any) => (
                            <div key={schedule.id} className="min-w-[200px] p-3 bg-white dark:bg-card rounded-lg border shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="secondary" className="font-mono">{getPeriodLabel(schedule.period)}</Badge>
                                </div>
                                <h3 className="font-semibold truncate">{schedule.course.class?.name || schedule.course.name}</h3>
                                <p className="text-sm text-muted-foreground truncate">{schedule.topic || "-"}</p>
                                <Button asChild variant="outline" size="sm" className="w-full mt-2">
                                    <Link href={`/teacher/courses/${schedule.courseId}/attendance/session?date=${format(new Date(), "yyyy-MM-dd")}&period=${schedule.period}`}>
                                        View
                                    </Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Needs Grading</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.ungraded || 0}</div>
                        <p className="text-xs text-muted-foreground">Submissions pending review</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.assignments || 0}</div>
                        <p className="text-xs text-muted-foreground">Currently open for students</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.courses || 0}</div>
                        <p className="text-xs text-muted-foreground">Active courses this term</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Recent Submissions */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Recent Submissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentSubmissions?.length === 0 && (
                                <p className="text-sm text-muted-foreground">No recent submissions.</p>
                            )}
                            {recentSubmissions?.map((submission: any) => (
                                <div key={submission.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{submission.student.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {submission.assignment.title} • {submission.assignment.course.name}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                            {format(new Date(submission.submittedAt), "MMM d, h:mm a")}
                                        </span>
                                        <Link href={`/teacher/courses/${submission.assignment.courseId}/tasks/${submission.assignmentId}`}>
                                            <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                                                Grade
                                            </Badge>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming Deadlines */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Upcoming Deadlines</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {upcomingAssignments?.length === 0 && (
                                <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
                            )}
                            {upcomingAssignments?.map((assignment: any) => (
                                <div key={assignment.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{assignment.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {assignment.course.name}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <Clock className="mr-1 h-3 w-3" />
                                            {format(new Date(assignment.dueDate), "MMM d")}
                                        </div>
                                        <Badge variant="secondary">
                                            {assignment._count.submissions} Submissions
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
