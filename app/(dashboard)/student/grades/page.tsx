import { getStudentGrades, getStudentSemesters, getStudentGradeHistory } from "@/lib/actions/student.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { SemesterSelector } from "@/components/student/grades/semester-selector"
import { GradeStatistics } from "@/components/student/grades/grade-statistics"
import { GradeHistoryChart } from "@/components/student/grades/grade-history-chart"

export default async function StudentGradesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedSearchParams = await searchParams
    const termId = typeof resolvedSearchParams.termId === 'string' ? resolvedSearchParams.termId : undefined

    const [gradesRes, semestersRes, historyRes] = await Promise.all([
        getStudentGrades(termId),
        getStudentSemesters(),
        getStudentGradeHistory()
    ])

    if ('error' in gradesRes || 'error' in semestersRes || 'error' in historyRes) {
        return <div>Error loading grades data</div>
    }

    const { grades } = gradesRes as { grades: any[] }
    const { semesters } = semestersRes as { semesters: any[] }
    const { history } = historyRes as { history: any[] }

    // Determine display title for the table
    let semesterTitle = "Active Semester"
    if (termId === 'all') {
        semesterTitle = "All History"
    } else if (termId) {
        const selectedSemester = semesters.find(s => s.id === termId)
        if (selectedSemester) {
            semesterTitle = `${selectedSemester.academicYear.name} ${selectedSemester.type}`
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">My Grades</h1>

            <GradeHistoryChart history={history} />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <SemesterSelector semesters={semesters} />
            </div>

            <GradeStatistics grades={grades} />

            <Card>
                <CardHeader>
                    <CardTitle>{semesterTitle} Grades</CardTitle>
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
                            {grades && grades.length > 0 ? (
                                grades.map((grade: any) => (
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
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                        No grades found for this semester.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
