import { getStudentGradesForTeacher, getStudentSemestersForTeacher, getStudentGradeHistoryForTeacher, getStudentBasicInfo } from "@/lib/actions/homeroom.actions"
import { SemesterSelector } from "@/components/student/grades/semester-selector"
import { GradeStatistics } from "@/components/student/grades/grade-statistics"
import { GradeHistoryChart } from "@/components/student/grades/grade-history-chart"
import { GradesTable } from "@/components/student/grades/grades-table"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{
        classId: string
        studentId: string
    }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TeacherStudentGradesPage(props: PageProps) {
    const params = await props.params;

    const { classId, studentId } = params;

    const resolvedSearchParams = await props.searchParams
    const termId = typeof resolvedSearchParams.termId === 'string' ? resolvedSearchParams.termId : undefined

    const [studentRes, gradesRes, semestersRes, historyRes] = await Promise.all([
        getStudentBasicInfo(studentId),
        getStudentGradesForTeacher(studentId, termId),
        getStudentSemestersForTeacher(studentId),
        getStudentGradeHistoryForTeacher(studentId)
    ])

    if ('error' in studentRes || 'error' in gradesRes || 'error' in semestersRes || 'error' in historyRes) {
        return <div className="p-8 text-red-500 bg-red-50 rounded-lg">Error loading grades data</div>
    }

    const { student } = studentRes as { student: { name: string, email: string } }
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
            <MobileHeaderSetter title={`${student.name}'s Grades`} />

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild className="-ml-3">
                    <Link href={`/homeroom/${classId}`}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Class
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">{student.name}&apos;s Grades</h1>
                    <p className="text-muted-foreground">{student.email}</p>
                </div>
            </div>

            <GradeHistoryChart history={history} />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <SemesterSelector semesters={semesters} />
            </div>

            <GradeStatistics grades={grades} />

            <GradesTable grades={grades} semesterTitle={semesterTitle} />
        </div>
    )
}
