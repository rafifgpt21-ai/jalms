import { getTeacherDashboardStats } from "@/lib/actions/teacher.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, FileText, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default async function TeacherDashboard() {
    const data = await getTeacherDashboardStats()

    if (data.error) {
        return <div className="p-6">Error loading dashboard: {data.error}</div>
    }

    const { stats, recentSubmissions, upcomingAssignments } = data

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Teacher Dashboard</h1>
                <p className="text-muted-foreground">Overview of your teaching activity.</p>
                <div className="mt-4">
                    <Link href="/teacher/attendance">
                        <Button>
                            <Clock className="mr-2 h-4 w-4" />
                            Take Attendance
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.courses || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.students || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.assignments || 0}</div>
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
