import { getUser } from "@/lib/actions/user.actions"
import { db as prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"

export default async function StudentAttendancePage() {
    const user = await getUser()
    if (!user) return <div>Unauthorized</div>

    // Fetch courses for the active semester where the student is enrolled
    const courses = await prisma.course.findMany({
        where: {
            studentIds: { has: user.id },
            term: { isActive: true },
            deletedAt: { isSet: false }
        },
        include: {
            attendances: {
                where: {
                    studentId: user.id,
                    deletedAt: { isSet: false }
                }
            }
        }
    })

    // Calculate summary stats across all courses
    let totalPresent = 0
    let totalAbsent = 0
    let totalExcused = 0
    let totalClasses = 0

    courses.forEach(course => {
        course.attendances.forEach(record => {
            if (record.status === 'SKIPPED') return // Don't count skipped/cancelled classes

            if (record.status === 'PRESENT') totalPresent++
            if (record.status === 'ABSENT') totalAbsent++
            if (record.status === 'EXCUSED') totalExcused++
            totalClasses++
        })
    })

    return (
        <div className="space-y-6">
            <MobileHeaderSetter title="My Attendance" />
            <h1 className="text-3xl font-bold">My Attendance</h1>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Present</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{totalPresent}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Absent</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{totalAbsent}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Excused</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{totalExcused}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Classes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalClasses}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Course List */}
            <Card>
                <CardHeader>
                    <CardTitle>Course Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Course Name</TableHead>
                                <TableHead>Present</TableHead>
                                <TableHead>Absent</TableHead>
                                <TableHead>Excused</TableHead>
                                <TableHead>Attendance Rate</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No enrolled courses found for the active semester.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                courses.map((course) => {
                                    const present = course.attendances.filter(r => r.status === 'PRESENT').length
                                    const absent = course.attendances.filter(r => r.status === 'ABSENT').length
                                    const excused = course.attendances.filter(r => r.status === 'EXCUSED').length
                                    // Exclude SKIPPED from total sessions count
                                    const validSessions = course.attendances.filter(r => r.status !== 'SKIPPED')
                                    const total = validSessions.length
                                    const rate = total > 0 ? Math.round(((present + excused) / total) * 100) : 100

                                    let statusVariant: "default" | "destructive" | "outline" | "secondary" = "default"
                                    let statusText = "Good"

                                    if (total > 0) {
                                        if (rate < 75) {
                                            statusVariant = "destructive"
                                            statusText = "Critical"
                                        } else if (rate < 85) {
                                            statusVariant = "secondary" // Yellow-ish usually
                                            statusText = "Warning"
                                        }
                                    } else {
                                        statusVariant = "outline"
                                        statusText = "N/A"
                                    }

                                    return (
                                        <TableRow key={course.id}>
                                            <TableCell className="font-medium">{course.name}</TableCell>
                                            <TableCell className="text-green-600 font-bold">{present}</TableCell>
                                            <TableCell className="text-red-600 font-bold">{absent}</TableCell>
                                            <TableCell className="text-yellow-600 font-bold">{excused}</TableCell>
                                            <TableCell>{total > 0 ? `${rate}%` : "-"}</TableCell>
                                            <TableCell>
                                                <Badge variant={statusVariant}>
                                                    {statusText}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
