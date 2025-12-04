import { getStudentGrades } from "@/lib/actions/student.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

export default async function StudentGradesPage() {
    const res = await getStudentGrades()

    if ('error' in res) {
        return <div>Error loading grades</div>
    }

    const { grades } = res

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">My Grades</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Active Semester Grades</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Course</TableHead>
                                <TableHead>Teacher</TableHead>
                                <TableHead>Attendance</TableHead>
                                <TableHead className="text-right">Overall Grade</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {grades && grades.map((grade: any) => (
                                <TableRow key={grade.courseId}>
                                    <TableCell className="font-medium">{grade.courseName}</TableCell>
                                    <TableCell>{grade.teacherName}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Progress value={grade.attendancePercentage} className="w-[60px]" />
                                            <span className="text-xs text-muted-foreground">{grade.attendancePercentage}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className={`text-lg font-bold ${grade.grade >= 90 ? 'text-green-600' :
                                                grade.grade >= 80 ? 'text-blue-600' :
                                                    grade.grade >= 70 ? 'text-yellow-600' : 'text-red-600'
                                            }`}>
                                            {grade.grade}%
                                        </span>
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
