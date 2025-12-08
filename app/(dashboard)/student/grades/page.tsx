import { getStudentGrades, getStudentSemesters, getStudentGradeHistory } from "@/lib/actions/student.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { SemesterSelector } from "@/components/student/grades/semester-selector"
import { GradeStatistics } from "@/components/student/grades/grade-statistics"
import { GradeHistoryChart } from "@/components/student/grades/grade-history-chart"
import { GradesTable } from "@/components/student/grades/grades-table"

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

            <GradesTable grades={grades} semesterTitle={semesterTitle} />
        </div>
    )
}
