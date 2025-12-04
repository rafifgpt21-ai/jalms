import { auth } from "@/auth"
import { getCourseAttendanceStats } from "@/lib/actions/attendance.actions"
import { AttendanceScoreDialog } from "@/components/teacher/attendance/attendance-score-dialog"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function CourseAttendanceStatsPage({
    params,
}: {
    params: Promise<{ courseId: string }>
}) {
    const session = await auth()
    if (!session?.user?.id) return <div>Not authenticated</div>

    const { courseId } = await params
    const { course, studentsStats, attendancePoolScore, error } = await getCourseAttendanceStats(courseId)

    if (error || !course || !studentsStats) {
        if (error === "Course not found") return notFound()
        return <div>Error: {error}</div>
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/teacher/attendance">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{course.name}</h1>
                        <p className="text-muted-foreground">
                            {course.class?.name} • Attendance Statistics
                        </p>
                    </div>
                </div>
                <AttendanceScoreDialog
                    courseId={courseId}
                    currentScore={attendancePoolScore || 0}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{studentsStats.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Attendance Pool</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{attendancePoolScore || 0} pts</div>
                        <p className="text-xs text-muted-foreground">Max points for 100% attendance</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {studentsStats.length > 0
                                ? Math.round(studentsStats.reduce((acc, s) => acc + s.attendancePercentage, 0) / studentsStats.length)
                                : 0}%
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Student Attendance Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student Name</TableHead>
                                <TableHead className="text-center">Present</TableHead>
                                <TableHead className="text-center">Absent</TableHead>
                                <TableHead className="text-center">Excused</TableHead>
                                <TableHead className="text-center">Skipped</TableHead>
                                <TableHead className="text-center">Total Sessions</TableHead>
                                <TableHead className="text-center">Percentage</TableHead>
                                <TableHead className="text-right">Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {studentsStats.map((stat) => (
                                <TableRow key={stat.student.id}>
                                    <TableCell className="font-medium">{stat.student.name}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            {stat.presentCount}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                            {stat.absentCount}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                            {stat.excusedCount}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center text-muted-foreground">
                                        {stat.skippedCount}
                                    </TableCell>
                                    <TableCell className="text-center">{stat.totalSessions}</TableCell>
                                    <TableCell className="text-center font-bold">
                                        {stat.attendancePercentage}%
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-blue-600">
                                        {stat.attendanceScore} pts
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
